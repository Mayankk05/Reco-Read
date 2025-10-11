package com.bookwise.respository;

import com.bookwise.entity.BookSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookSummaryRepository extends JpaRepository<BookSummary, Long> {

    /**
     * Find summaries by book ID ordered by creation date
     */
    List<BookSummary> findByBookIdOrderByCreatedAtDesc(Long bookId);

    /**
     * ✅ Find existing summaries with same original text (for caching)
     */
    List<BookSummary> findByBookIdAndOriginalText(Long bookId, String originalText);

    /**
     * Count summaries by book ID
     */
    long countByBookId(Long bookId);

    /**
     * Delete all summaries for a book
     */
    void deleteByBookId(Long bookId);
}
