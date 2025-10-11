package com.bookwise.service;

import com.bookwise.dto.request.SummaryRequest;
import com.bookwise.dto.response.SummaryResponse;
import com.bookwise.entity.Book;
import com.bookwise.entity.BookSummary;
import com.bookwise.exception.BookNotFoundException;
import com.bookwise.exception.ExternalApiException;
import com.bookwise.respository.BookRepository;
import com.bookwise.respository.BookSummaryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AISummaryService {

    private final BookRepository bookRepository;
    private final BookSummaryRepository bookSummaryRepository;
    private final WebClient webClient;

    // Full fixed URL including model and generateContent
    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final Map<Long, LocalDateTime> lastRequestTime = new ConcurrentHashMap<>();
    private static final int MIN_REQUEST_INTERVAL_SECONDS = 10;

    @Transactional
    public SummaryResponse generateSummary(Long bookId, Long userId, SummaryRequest request) {
        log.info("Generating summary for book ID: {} for user: {}", bookId, userId);

        if (isRateLimited(userId)) {
            throw new ExternalApiException("Please wait before generating another summary. Rate limit: one request per "
                    + MIN_REQUEST_INTERVAL_SECONDS + " seconds.");
        }

        Book book = bookRepository.findByIdAndUserId(bookId, userId)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ID: " + bookId));

        String originalText = request.getOriginalText().trim();
        List<BookSummary> existing = bookSummaryRepository.findByBookIdAndOriginalText(bookId, originalText);
        if (!existing.isEmpty()) {
            return mapToSummaryResponse(existing.get(0));
        }

        try {
            lastRequestTime.put(userId, LocalDateTime.now());
            // Trim to 500 chars to reserve tokens for output
            String prompt = originalText.length() > 500
                    ? originalText.substring(0, 500) + "…"
                    : originalText;
            String summaryText = callGeminiWithRetry(prompt, 3);
            BookSummary summary = BookSummary.builder()
                    .book(book)
                    .originalText(originalText)
                    .summaryText(summaryText)
                    .aiProvider("gemini")
                    .build();
            BookSummary saved = bookSummaryRepository.save(summary);
            return mapToSummaryResponse(saved);
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("429")) {
                throw new ExternalApiException("Gemini API rate limit exceeded. Please try again later.");
            }
            if (msg != null && msg.contains("quota")) {
                throw new ExternalApiException("Gemini API quota exceeded. Please check your Google Cloud account.");
            }
            throw new ExternalApiException("Failed to generate summary: " + msg);
        }
    }

    private boolean isRateLimited(Long userId) {
        LocalDateTime last = lastRequestTime.get(userId);
        return last != null && last.plusSeconds(MIN_REQUEST_INTERVAL_SECONDS).isAfter(LocalDateTime.now());
    }

    private String callGeminiWithRetry(String text, int maxRetries) {
        int attempt = 0;
        Exception lastEx = null;
        while (attempt < maxRetries) {
            try {
                attempt++;
                log.info("Calling Gemini API (attempt {}/{})", attempt, maxRetries);
                return callGemini(text);
            } catch (Exception e) {
                lastEx = e;
                log.warn("Attempt {}/{} failed: {}", attempt, maxRetries, e.getMessage());
                if (!e.getMessage().contains("429")) break;
                try { Thread.sleep((long) Math.pow(2, attempt) * 1000); }
                catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        }
        throw new ExternalApiException("Failed after " + maxRetries + " retries: "
                + (lastEx != null ? lastEx.getMessage() : "Unknown error"));
    }

    private String callGemini(String text) {
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", "Please summarize this text in 2-3 sentences: " + text)
                        })
                },
                // Increase token budget
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 300,
                        "topP", 0.8,
                        "topK", 10
                ),
                "safetySettings", new Object[] {
                        Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_NONE"),
                        Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_NONE"),
                        Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_NONE"),
                        Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_NONE")
                }
        );

        String url = geminiApiUrl + "?key=" + geminiApiKey;

        try {
            Mono<String> mono = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class);
            String resp = mono.block();
            log.debug("Raw Gemini response: {}", resp);
            return extractResponseContent(resp);
        } catch (WebClientResponseException e) {
            throw new ExternalApiException("Gemini API HTTP error: " + e.getStatusCode());
        } catch (Exception e) {
            throw new ExternalApiException("Failed to call Gemini API: " + e.getMessage());
        }
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            if (root.has("error")) {
                String msg = root.get("error").path("message").asText();
                throw new ExternalApiException("Gemini API error: " + msg);
            }

            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.size() == 0) {
                log.warn("No candidates: {}", response);
                return "[Summary unavailable: no candidates]";
            }

            JsonNode candidate = candidates.get(0);
            String reason = candidate.path("finishReason").asText();
            if (!"STOP".equals(reason)) {
                log.warn("FinishReason={}: {}", reason, response);
            }

            JsonNode parts = candidate.path("content").path("parts");
            if (!parts.isArray() || parts.size() == 0) {
                log.warn("No parts in candidate content: {}", response);
                return "[Summary unavailable: filtered or too long]";
            }
            String text = parts.get(0).path("text").asText("");
            return text.isBlank() ? "[Summary unavailable: empty]" : text.trim();
        } catch (ExternalApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error parsing response: {}", e.getMessage());
            return "[Summary unavailable: parse error]";
        }
    }

    @Transactional(readOnly = true)
    public List<SummaryResponse> getAllSummaries(Long bookId, Long userId) {
        bookRepository.findByIdAndUserId(bookId, userId)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ID: " + bookId));
        return bookSummaryRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream()
                .map(this::mapToSummaryResponse)
                .toList();
    }

    private SummaryResponse mapToSummaryResponse(BookSummary s) {
        return SummaryResponse.builder()
                .id(s.getId())
                .bookId(s.getBook().getId())
                .originalText(s.getOriginalText())
                .summaryText(s.getSummaryText())
                .aiProvider(s.getAiProvider())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
