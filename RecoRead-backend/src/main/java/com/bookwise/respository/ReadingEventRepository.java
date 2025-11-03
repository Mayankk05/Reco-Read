package com.bookwise.respository;

import com.bookwise.entity.ReadingEvent;
import com.bookwise.entity.ReadingEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ReadingEventRepository extends JpaRepository<ReadingEvent, Long> {

    List<ReadingEvent> findByBookIdAndUserIdOrderByCreatedAtDesc(Long bookId, Long userId);

    Optional<ReadingEvent> findTopByBookIdAndUserIdOrderByCreatedAtDesc(Long bookId, Long userId);

    List<ReadingEvent> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ReadingEvent> findTopByBookIdAndUserIdAndEventTypeInOrderByCreatedAtDesc(Long bookId, Long userId, List<ReadingEventType> eventTypes);

    Optional<ReadingEvent> findTopByBookIdAndUserIdAndProgressPercentIsNotNullOrderByCreatedAtDesc(Long bookId, Long userId);

    Optional<ReadingEvent> findTopByBookIdAndUserIdAndPageIsNotNullOrderByCreatedAtDesc(Long bookId, Long userId);
    long countByBookIdAndUserId(Long bookId, Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    void deleteByBookIdAndUserId(Long bookId, Long userId);

}