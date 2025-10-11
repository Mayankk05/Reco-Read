package com.bookwise.service;

import com.bookwise.dto.response.BookResponse;
import com.bookwise.dto.response.RecommendationResponse;
import com.bookwise.entity.Book;
import com.bookwise.exception.BookNotFoundException;
import com.bookwise.respository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final BookRepository bookRepository;
    private final GoogleBooksService googleBooksService;

    @Transactional(readOnly = true)
    public RecommendationResponse getRecommendations(Long bookId, Long userId, Integer limit) {
        log.info("Getting recommendations for book ID: {} for user: {}, limit: {}", bookId, userId, limit);

        Book source = bookRepository.findByIdAndUserIdWithTags(bookId, userId)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ID: " + bookId));

        List<String> tags = source.getTags();

        List<Book> candidates = List.of();
        if (tags != null && !tags.isEmpty()) {
            candidates = bookRepository.findBooksWithSharedTagsByUserId(
                    tags, bookId, userId
            );
        }

        // If no local candidates found, fallback to Google Books API
        if (candidates.isEmpty()) {
            String query = source.getTitle() + (source.getAuthor() != null ? " " + source.getAuthor() : "");
            log.info("No local candidates found. Falling back to Google Books API with query: {}", query);
            var googleBooksResponse = googleBooksService.searchBooks(query, limit);
            List<BookResponse> googleRecommendations = googleBooksResponse.getItems().stream()
                    // Map GoogleBookItem to BookResponse (implement mapGoogleBookToBookResponse)
                    .map(this::mapGoogleBookToBookResponse)
                    .collect(Collectors.toList());

            return RecommendationResponse.builder()
                    .sourceBook(map(source))
                    .recommendations(googleRecommendations.stream()
                            .map(book -> RecommendationResponse.BookRecommendation.builder()
                                    .book(book)
                                    .reason("Recommended from Google Books API")
                                    .build())
                            .collect(Collectors.toList()))
                    .build();
        }

        List<RecommendationResponse.BookRecommendation> recs = candidates.stream()
                .map(b -> {
                    List<String> shared = b.getTags().stream()
                            .filter(tags::contains)
                            .collect(Collectors.toList());
                    return RecommendationResponse.BookRecommendation.builder()
                            .book(map(b))
                            .sharedTags(shared)
                            .reason("Because you liked " + shared.get(0))
                            .build();
                })
                .sorted((a, b) -> Integer.compare(b.getSharedTags().size(), a.getSharedTags().size()))
                .limit(limit == null ? 3 : limit)
                .collect(Collectors.toList());

        log.info("Found {} recommendations", recs.size());
        return RecommendationResponse.builder()
                .sourceBook(map(source))
                .recommendations(recs)
                .build();
    }

    private BookResponse map(Book b) {
        return BookResponse.builder()
                .id(b.getId())
                .googleBooksId(b.getGoogleBooksId())
                .title(b.getTitle())
                .author(b.getAuthor())
                .publisher(b.getPublisher())
                .publishedDate(b.getPublishedDate())
                .description(b.getDescription())
                .coverImageUrl(b.getCoverImageUrl())
                .isbn10(b.getIsbn10())
                .isbn13(b.getIsbn13())
                .pageCount(b.getPageCount())
                .tags(b.getTags())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }


    private BookResponse mapGoogleBookToBookResponse(com.bookwise.dto.external.GoogleBookItem googleBook) {
        var volume = googleBook.getVolumeInfo();
        List<String> tags = volume.getCategories() != null
                ? volume.getCategories().stream()
                .flatMap(c -> Arrays.stream(c.split("/")))
                .map(s -> s.trim().toLowerCase())
                .filter(s -> !s.isEmpty())
                .distinct()
                .limit(3)
                .toList()
                : List.of();

        return BookResponse.builder()
                .googleBooksId(googleBook.getId())
                .title(volume.getTitle())
                .author(volume.getAuthors() != null && !volume.getAuthors().isEmpty() ? volume.getAuthors().get(0) : null)
                .publisher(volume.getPublisher())
                .description(volume.getDescription())
                .coverImageUrl(volume.getImageLinks() != null ? volume.getImageLinks().getThumbnail() : null)
                .pageCount(volume.getPageCount())
                .tags(tags)
                //.publishedDate(parseDateIfNeeded(volume.getPublishedDate())) Optional
                .build();
    }
}
