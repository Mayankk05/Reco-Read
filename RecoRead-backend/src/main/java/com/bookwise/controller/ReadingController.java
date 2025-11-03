package com.bookwise.controller;

import com.bookwise.dto.request.ReadingEventRequest;
import com.bookwise.dto.response.ReadingEventResponse;
import com.bookwise.dto.response.ReadingStateResponse;
import com.bookwise.security.UserPrincipal;
import com.bookwise.service.ReadingHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${app.cors.allowed-origins:*}")
public class ReadingController {

    private final ReadingHistoryService readingHistoryService;

    @PostMapping("/books/{bookId}/reading-events")
    public ResponseEntity<ReadingEventResponse> logReadingEvent(
            @PathVariable Long bookId,
            @Valid @RequestBody ReadingEventRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("Log reading event {} on book {} for user {}", request.getEventType(), bookId, currentUser.getId());
        return ResponseEntity.ok(readingHistoryService.logEvent(bookId, currentUser.getId(), request));
    }

    @GetMapping("/books/{bookId}/reading-events")
    public ResponseEntity<List<ReadingEventResponse>> getBookReadingEvents(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(readingHistoryService.eventsForBook(bookId, currentUser.getId()));
    }

    @GetMapping("/books/{bookId}/reading-state")
    public ResponseEntity<ReadingStateResponse> getLatestReadingState(
            @PathVariable Long bookId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(readingHistoryService.latestStateForBook(bookId, currentUser.getId()));
    }

    @GetMapping("/reading/history")
    public ResponseEntity<List<ReadingEventResponse>> getRecentHistory(
            @RequestParam(required = false) Integer limit,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(readingHistoryService.getRecent(currentUser.getId(), limit));
    }
}