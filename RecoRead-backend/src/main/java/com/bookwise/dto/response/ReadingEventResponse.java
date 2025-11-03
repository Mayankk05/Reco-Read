package com.bookwise.dto.response;


import com.bookwise.entity.ReadingEventType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReadingEventResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookCoverImageUrl;
    private ReadingEventType eventType;
    private Integer page;
    private Integer progressPercent;
    private Integer durationSeconds;
    private String note;
    private LocalDateTime createdAt;
}