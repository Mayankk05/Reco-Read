package com.bookwise.dto.request;


import com.bookwise.entity.ReadingEventType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReadingEventRequest {

    @NotNull(message = "Event type is required")
    private ReadingEventType eventType;

    private Integer page;
    private Integer progressPercent;
    private Integer durationSeconds;

    @Size(max = 2000, message = "Note cannot exceed 2000 characters")
    private String note;
}