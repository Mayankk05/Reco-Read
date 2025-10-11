package com.bookwise.respository;

import com.bookwise.entity.ReadingEvent;
import com.bookwise.entity.ReadingEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for ReadingEvent.
 * Note: Property paths like BookId/UserId resolve to nested fields book.id and user.id.
 */
public interface ReadingEventRepository extends JpaRepository<ReadingEvent, Long> {

    // ---------- Used by ReadingHistoryService ----------
    // All events for a book/user, newest first
    List<ReadingEvent> findByBookIdAndUserIdOrderByCreatedAtDesc(Long bookId, Long userId);

    // Latest single event (safe Optional result)
    Optional<ReadingEvent> findTopByBookIdAndUserIdOrderByCreatedAtDesc(Long bookId, Long userId);

    // Recent events across all books for a user, newest first
    List<ReadingEvent> findByUserIdOrderByCreatedAtDesc(Long userId);

    // New: latest "state-carrying" events
    Optional<ReadingEvent> findTopByBookIdAndUserIdAndEventTypeInOrderByCreatedAtDesc(Long bookId, Long userId, List<ReadingEventType> eventTypes);

    Optional<ReadingEvent> findTopByBookIdAndUserIdAndProgressPercentIsNotNullOrderByCreatedAtDesc(Long bookId, Long userId);

    Optional<ReadingEvent> findTopByBookIdAndUserIdAndPageIsNotNullOrderByCreatedAtDesc(Long bookId, Long userId);

    // ---------- Used by BookService (service-level cascade) ----------
    long countByBookIdAndUserId(Long bookId, Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    void deleteByBookIdAndUserId(Long bookId, Long userId);

    /*
     If you prefer explicit JPQL, you could use:

     @Query("select re from ReadingEvent re where re.book.id = :bookId and re.user.id = :userId order by re.createdAt desc")
     List<ReadingEvent> findByBookAndUser(@Param("bookId") Long bookId, @Param("userId") Long userId);

     @Modifying @Transactional
     @Query("delete from ReadingEvent re where re.book.id = :bookId and re.user.id = :userId")
     void deleteByBookAndUser(@Param("bookId") Long bookId, @Param("userId") Long userId);
    */
}