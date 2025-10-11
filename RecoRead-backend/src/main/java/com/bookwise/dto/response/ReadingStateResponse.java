package com.bookwise.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReadingStateResponse {
    private Long bookId;
    private Integer page;             // latest known page
    private Integer progressPercent;  // latest known percent
    private String note;              // latest note (if any)
    private LocalDateTime updatedAt;  // timestamp of latest event considered
}
