package com.bookwise.respository;

import com.bookwise.entity.BookSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookSummaryRepository extends JpaRepository<BookSummary, Long> {

    List<BookSummary> findByBookIdOrderByCreatedAtDesc(Long bookId);

    List<BookSummary> findByBookIdAndOriginalText(Long bookId, String originalText);
    long countByBookId(Long bookId);
    void deleteByBookId(Long bookId);
}
