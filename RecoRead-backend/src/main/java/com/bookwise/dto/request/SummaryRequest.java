package com.bookwise.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SummaryRequest {

    @NotBlank(message = "Original text is required")
    @Size(max = 5000, message = "Original text cannot exceed 5000 characters")
    private String originalText;
}
