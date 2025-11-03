package com.bookwise.dto.request;

import com.bookwise.jackson.LocalDateFlexibleDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AddBookRequest {

    private String googleBooksId;

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String title;

    private String author;

    private String publisher;
    @JsonDeserialize(using = LocalDateFlexibleDeserializer.class)
    private LocalDate publishedDate;

    private String description;

    private String coverImageUrl;

    @Size(max = 10, message = "ISBN-10 cannot exceed 10 characters")
    private String isbn10;

    @Size(max = 13, message = "ISBN-13 cannot exceed 13 characters")
    private String isbn13;

    private Integer pageCount;

    @Size(max = 3, message = "Maximum 3 tags allowed")
    private List<String> tags;
}