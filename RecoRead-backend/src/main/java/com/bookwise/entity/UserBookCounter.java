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

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Version
    private Long version;

    @Column(name = "last_book_no", nullable = false)
    private Integer lastBookNo;
}