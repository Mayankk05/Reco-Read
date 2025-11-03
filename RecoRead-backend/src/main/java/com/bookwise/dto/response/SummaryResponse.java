package com.bookwise.dto.response;



import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SummaryResponse {

    private Long id;
    private Long bookId;
    private String originalText;
    private String summaryText;
    private String aiProvider;
    private LocalDateTime createdAt;
}

