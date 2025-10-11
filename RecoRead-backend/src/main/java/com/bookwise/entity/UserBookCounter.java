package com.bookwise.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_counters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBookCounter {

    // Use user_id as the primary key to keep one counter row per user
    @Id
    @Column(name = "user_id")
    private Long userId;

    // Optimistic locking to avoid race conditions
    @Version
    private Long version;

    @Column(name = "last_book_no", nullable = false)
    private Integer lastBookNo;
}