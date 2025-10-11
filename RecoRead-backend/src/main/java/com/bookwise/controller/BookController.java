package com.bookwise.controller;

import com.bookwise.dto.request.AddBookRequest;
import com.bookwise.dto.request.SummaryRequest;
import com.bookwise.dto.response.BookResponse;
import com.bookwise.dto.response.RecommendationResponse;
import com.bookwise.dto.response.SearchResponse;
import com.bookwise.dto.response.SummaryResponse;
import com.bookwise.security.UserPrincipal;
import com.bookwise.service.AISummaryService;
import com.bookwise.service.BookService;
import com.bookwise.service.GoogleBooksService;
import com.bookwise.service.RecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class BookController {

    private final BookService bookService;
    private final GoogleBooksService googleBooksService;
    private final AISummaryService aiSummaryService;
    private final RecommendationService recommendationService;

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> searchBooks(
            @RequestParam String q,
            @RequestParam(required = false) Integer maxResults) {

        log.info("Searching books with query: {}", q);
        SearchResponse response = googleBooksService.searchBooks(q, maxResults);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BookResponse> addBook(
            @Valid @RequestBody AddBookRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Adding book for user {}: {}", currentUser.getId(), request.getTitle());
        BookResponse response = bookService.addBook(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<BookResponse>> getAllBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Getting books for user {} with search: {}, tag: {}", currentUser.getId(), search, tag);
        Page<BookResponse> response = bookService.getAllBooks(search, tag, currentUser.getId(), pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Getting book {} for user {}", id, currentUser.getId());
        BookResponse response = bookService.getBookById(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // New: fetch a book by the per-user number (userBookNo), e.g., /api/books/no/1
    @GetMapping("/no/{no}")
    public ResponseEntity<BookResponse> getBookByUserNumber(
            @PathVariable Integer no,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Getting book number {} for user {}", no, currentUser.getId());
        BookResponse response = bookService.getBookByUserNo(no, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Deleting book {} for user {}", id, currentUser.getId());
        bookService.deleteBook(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/summary")
    public ResponseEntity<SummaryResponse> generateSummary(
            @PathVariable Long id,
            @Valid @RequestBody SummaryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Generating summary for book {} for user {}", id, currentUser.getId());
        SummaryResponse response = aiSummaryService.generateSummary(id, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/summaries")
    public ResponseEntity<List<SummaryResponse>> getBookSummaries(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Getting summaries for book {} for user {}", id, currentUser.getId());
        List<SummaryResponse> response = aiSummaryService.getAllSummaries(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @PathVariable Long id,
            @RequestParam(required = false) Integer limit,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Getting recommendations for book {} for user {}", id, currentUser.getId());
        RecommendationResponse response = recommendationService.getRecommendations(id, currentUser.getId(), limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> getAllTags(@AuthenticationPrincipal UserPrincipal currentUser) {
        log.info("Getting all tags for user {}", currentUser.getId());
        List<String> tags = bookService.getAllTags(currentUser.getId());
        return ResponseEntity.ok(tags);
    }
}