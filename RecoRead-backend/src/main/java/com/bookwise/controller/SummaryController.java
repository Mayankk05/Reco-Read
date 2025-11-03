package com.bookwise.controller;

import com.bookwise.security.UserPrincipal;
import com.bookwise.service.AISummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/summaries")
@RequiredArgsConstructor
public class SummaryController {

    private final AISummaryService aiSummaryService;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSummary(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        aiSummaryService.deleteSummary(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}