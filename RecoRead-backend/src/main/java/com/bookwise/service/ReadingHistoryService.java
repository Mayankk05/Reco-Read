package com.bookwise.service;


import com.bookwise.dto.request.ReadingEventRequest;
import com.bookwise.dto.response.ReadingEventResponse;
import com.bookwise.dto.response.ReadingStateResponse;
import com.bookwise.entity.Book;
import com.bookwise.entity.ReadingEvent;
import com.bookwise.entity.ReadingEventType;
import com.bookwise.entity.User;

import com.bookwise.respository.BookRepository;
import com.bookwise.respository.ReadingEventRepository;
import com.bookwise.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadingHistoryService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReadingEventRepository readingEventRepository;

    @Transactional
    public ReadingEventResponse logEvent(Long bookId, Long userId, ReadingEventRequest req) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        // Ownership check if your Book has a user/owner
        if (book.getUser() == null || !book.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Book does not belong to the current user.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Normalize: if percent missing but page present (and pageCount known), derive percent, and vice versa
        Integer normalizedPercent = req.getProgressPercent();
        Integer normalizedPage = req.getPage();

        if (book.getPageCount() != null && book.getPageCount() > 0) {
            int total = book.getPageCount();
            if (normalizedPage != null && normalizedPercent == null) {
                normalizedPercent = Math.max(0, Math.min(100, Math.round(normalizedPage * 100f / total)));
            } else if (normalizedPercent != null && normalizedPage == null) {
                normalizedPage = Math.max(0, Math.min(total, Math.round(normalizedPercent * total / 100f)));
            }
        }

        ReadingEvent saved = readingEventRepository.save(
                ReadingEvent.builder()
                        .book(book)
                        .user(user)
                        .eventType(req.getEventType())
                        .page(normalizedPage)
                        .progressPercent(normalizedPercent)
                        .durationSeconds(req.getDurationSeconds())
                        .note(req.getNote())
                        .build()
        );

        log.info("Logged reading event {} for user {} on book {}", req.getEventType(), userId, bookId);
        return map(saved);
    }

    @Transactional(readOnly = true)
    public List<ReadingEventResponse> eventsForBook(Long bookId, Long userId) {
        // Validate access
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));
        if (book.getUser() == null || !book.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Book does not belong to the current user.");
        }

        return readingEventRepository.findByBookIdAndUserIdOrderByCreatedAtDesc(bookId, userId)
                .stream().map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public ReadingStateResponse latestStateForBook(Long bookId, Long userId) {
        // Validate access
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));
        if (book.getUser() == null || !book.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Book does not belong to the current user.");
        }

        // Prefer the latest PROGRESS/FINISHED event
        Optional<ReadingEvent> best = readingEventRepository
                .findTopByBookIdAndUserIdAndEventTypeInOrderByCreatedAtDesc(
                        bookId,
                        userId,
                        List.of(ReadingEventType.PROGRESS, ReadingEventType.FINISHED)
                );

        // If none, try any event that carries state (percent or page)
        if (best.isEmpty()) {
            best = readingEventRepository.findTopByBookIdAndUserIdAndProgressPercentIsNotNullOrderByCreatedAtDesc(bookId, userId);
        }
        if (best.isEmpty()) {
            best = readingEventRepository.findTopByBookIdAndUserIdAndPageIsNotNullOrderByCreatedAtDesc(bookId, userId);
        }

        // If still none, return empty/default state
        return best.map(e -> {
                    Integer percent = e.getProgressPercent();
                    Integer page = e.getPage();

                    // Derive the missing piece from pageCount if possible
                    Integer total = book.getPageCount();
                    if (total != null && total > 0) {
                        if (percent == null && page != null) {
                            percent = Math.max(0, Math.min(100, Math.round(page * 100f / total)));
                        } else if (page == null && percent != null) {
                            page = Math.max(0, Math.min(total, Math.round(percent * total / 100f)));
                        }
                        // If FINISHED without page, assume last page
                        if (e.getEventType() == ReadingEventType.FINISHED && page == null) {
                            page = total;
                        }
                    }

                    return ReadingStateResponse.builder()
                            .bookId(bookId)
                            .page(page)
                            .progressPercent(percent)
                            .note(e.getNote())
                            .updatedAt(e.getCreatedAt())
                            .build();
                })
                .orElseGet(() -> ReadingStateResponse.builder()
                        .bookId(bookId)
                        .page(null)
                        .progressPercent(null)
                        .note(null)
                        .updatedAt(null)
                        .build());
    }

    @Transactional(readOnly = true)
    public List<ReadingEventResponse> getRecent(Long userId, Integer limit) {
        List<ReadingEventResponse> all = readingEventRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::map).toList();
        if (limit == null || limit <= 0) return all;
        return all.stream().sorted(Comparator.comparing(ReadingEventResponse::getCreatedAt).reversed())
                .limit(limit).toList();
    }

    private ReadingEventResponse map(ReadingEvent e) {
        return ReadingEventResponse.builder()
                .id(e.getId())
                .bookId(e.getBook().getId())
                .bookTitle(e.getBook().getTitle())
                .bookCoverImageUrl(e.getBook().getCoverImageUrl())
                .eventType(e.getEventType())
                .page(e.getPage())
                .progressPercent(e.getProgressPercent())
                .durationSeconds(e.getDurationSeconds())
                .note(e.getNote())
                .createdAt(e.getCreatedAt())
                .build();
    }
}