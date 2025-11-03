package com.bookwise.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_events", indexes = {
        @Index(name = "idx_reading_user_created", columnList = "user_id, created_at"),
        @Index(name = "idx_reading_book_user_created", columnList = "book_id, user_id, created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", length = 20, nullable = false)
    private ReadingEventType eventType; // OPENED, PROGRESS, FINISHED

    @Column(name = "page")
    private Integer page;

    @Column(name = "progress_percent")
    private Integer progressPercent;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}