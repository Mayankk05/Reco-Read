package com.bookwise.respository;

import com.bookwise.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByGoogleBooksIdAndUserId(String googleBooksId, Long userId);

    Optional<Book> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN FETCH b.tags WHERE b.id = :id AND b.user.id = :userId")
    Optional<Book> findByIdAndUserIdWithTags(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN FETCH b.summaries WHERE b.id = :id AND b.user.id = :userId")
    Optional<Book> findByIdAndUserIdWithSummaries(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT DISTINCT t FROM Book b JOIN b.tags t WHERE b.user.id = :userId ORDER BY t ASC")
    List<String> findDistinctTagsByUserId(@Param("userId") Long userId);

    Page<Book> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.user.id = :userId AND " +
            "(LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Book> findByTitleOrAuthorContainingIgnoreCaseAndUserId(
            @Param("search") String search, @Param("userId") Long userId, Pageable pageable);

    @Query("SELECT DISTINCT b FROM Book b JOIN b.tags t WHERE t = :tag AND b.user.id = :userId")
    Page<Book> findByTagAndUserId(@Param("tag") String tag, @Param("userId") Long userId, Pageable pageable);

    @Query("SELECT DISTINCT b FROM Book b JOIN b.tags t WHERE t = :tag AND " +
            "(LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%'))) AND b.user.id = :userId")
    Page<Book> findByTagAndSearchAndUserId(
            @Param("tag") String tag, @Param("search") String search, @Param("userId") Long userId, Pageable pageable);

    @Query("SELECT DISTINCT b FROM Book b JOIN b.tags t WHERE b.user.id = :userId AND " +
            "b.id <> :excludeBookId AND t IN :tags")
    List<Book> findBooksWithSharedTagsByUserId(
            @Param("tags") List<String> tags,
            @Param("excludeBookId") Long excludeBookId,
            @Param("userId") Long userId
    );

    Optional<Book> findByUserIdAndUserBookNo(Long userId, Integer userBookNo);

    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN FETCH b.tags WHERE b.user.id = :userId AND b.userBookNo = :no")
    Optional<Book> findByUserIdAndUserBookNoWithTags(@Param("userId") Long userId, @Param("no") Integer userBookNo);
}