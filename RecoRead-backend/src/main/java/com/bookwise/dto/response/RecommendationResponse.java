package com.bookwise.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RecommendationResponse {
    private BookResponse sourceBook;
    private List<BookRecommendation> recommendations;

    @Data
    @Builder
    public static class BookRecommendation {
        private BookResponse book;
        private String reason;
        private List<String> sharedTags;
    }
}
