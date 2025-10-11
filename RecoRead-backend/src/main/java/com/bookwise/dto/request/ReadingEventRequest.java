package com.bookwise.dto.request;


import com.bookwise.entity.ReadingEventType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReadingEventRequest {

    @NotNull(message = "Event type is required")
    private ReadingEventType eventType; // OPENED, PROGRESS, FINISHED

    private Integer page;             // current page
    private Integer progressPercent;  // 0..100
    private Integer durationSeconds;  // seconds

    @Size(max = 2000, message = "Note cannot exceed 2000 characters")
    private String note;
}