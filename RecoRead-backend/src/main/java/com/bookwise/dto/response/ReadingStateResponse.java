package com.bookwise.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReadingStateResponse {
    private Long bookId;
    private Integer page;
    private Integer progressPercent;
    private String note;
    private LocalDateTime updatedAt;
}
