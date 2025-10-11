package com.bookwise.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookResponse {
    private Long id;
    private Integer userBookNo; // new: per-user number

    private String googleBooksId;
    private String title;
    private String author;
    private String publisher;
    private LocalDate publishedDate;
    private String description;
    private String coverImageUrl;
    private String isbn10;
    private String isbn13;
    private Integer pageCount;

    private List<String> tags;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}