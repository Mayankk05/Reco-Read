package com.bookwise.service;

import com.bookwise.dto.request.AddBookRequest;
import com.bookwise.dto.response.BookResponse;
import com.bookwise.entity.Book;
import com.bookwise.entity.User;
import com.bookwise.exception.BookNotFoundException;
import com.bookwise.exception.UserNotFoundException;
import com.bookwise.respository.BookRepository;
import com.bookwise.respository.ReadingEventRepository;
import com.bookwise.respository.UserBookCounterRepository;
import com.bookwise.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReadingEventRepository readingEventRepository;
    private final UserBookCounterRepository userBookCounterRepository;

    @Transactional
    public BookResponse addBook(AddBookRequest request, Long userId) {
        log.info("Adding book for user ID {}: {}", userId, request.getTitle());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (StringUtils.hasText(request.getGoogleBooksId())) {
            bookRepository.findByGoogleBooksIdAndUserId(request.getGoogleBooksId(), userId)
                    .ifPresent(existingBook -> {
                        log.warn("Book already exists for user {} with Google Books ID: {}", userId, request.getGoogleBooksId());
                        throw new IllegalStateException("Duplicate book");
                    });
        }

        int nextNo = nextUserBookNo(user.getId());

        Book book = Book.builder()
                .user(user)
                .userBookNo(nextNo)
                .googleBooksId(request.getGoogleBooksId())
                .title(request.getTitle())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .publishedDate(request.getPublishedDate())
                .description(request.getDescription())
                .coverImageUrl(request.getCoverImageUrl())
                .isbn10(request.getIsbn10())
                .isbn13(request.getIsbn13())
                .pageCount(request.getPageCount())
                .build();

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            List<String> normalizedTags = request.getTags().stream()
                    .filter(StringUtils::hasText)
                    .map(tag -> tag.toLowerCase().trim())
                    .distinct()
                    .toList();
            book.getTags().clear();
            book.getTags().addAll(normalizedTags);
        }

        Book savedBook = bookRepository.save(book);
        log.info("Book added for user {} with global ID {} and userBookNo {} (tags: {})",
                userId, savedBook.getId(), savedBook.getUserBookNo(),
                savedBook.getTags() == null ? 0 : savedBook.getTags().size());

        return mapToBookResponse(savedBook);
    }
    @Transactional
    protected int nextUserBookNo(Long userId) {
        int updated = userBookCounterRepository.incrementExisting(userId);
        if (updated == 1) {
            Integer val = userBookCounterRepository.getLastBookNo(userId);
            if (val == null) throw new IllegalStateException("Counter read failed after increment");
            return val;
        }
        try {
            userBookCounterRepository.insertFirst(userId);
            return 1;
        } catch (DataIntegrityViolationException dup) {
            int inc = userBookCounterRepository.incrementExisting(userId);
            if (inc != 1) throw new IllegalStateException("Counter increment failed after duplicate insert");
            Integer val = userBookCounterRepository.getLastBookNo(userId);
            if (val == null) throw new IllegalStateException("Counter read failed after duplicate insert");
            return val;
        }
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id, Long userId) {
        log.info("Fetching book with ID: {} for user: {}", id, userId);

        Book book = bookRepository.findByIdAndUserIdWithTags(id, userId)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ID: " + id));

        return mapToBookResponse(book);
    }

    @Transactional(readOnly = true)
    public BookResponse getBookByUserNo(Integer no, Long userId) {
        log.info("Fetching book no {} for user: {}", no, userId);
        Book book = bookRepository.findByUserIdAndUserBookNoWithTags(userId, no)
                .orElseGet(() ->
                        bookRepository.findByUserIdAndUserBookNo(userId, no)
                                .orElseThrow(() -> new BookNotFoundException("Book not found with number: " + no))
                );
        return mapToBookResponse(book);
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> getAllBooks(String search, String tag, Long userId, Pageable pageable) {
        log.info("Fetching books for user: {} with search: {}, tag: {}", userId, search, tag);

        Page<Book> books;
        if (StringUtils.hasText(search) && StringUtils.hasText(tag)) {
            books = bookRepository.findByTagAndSearchAndUserId(tag.toLowerCase().trim(), search.trim(), userId, pageable);
        } else if (StringUtils.hasText(search)) {
            books = bookRepository.findByTitleOrAuthorContainingIgnoreCaseAndUserId(search.trim(), userId, pageable);
        } else if (StringUtils.hasText(tag)) {
            books = bookRepository.findByTagAndUserId(tag.toLowerCase().trim(), userId, pageable);
        } else {
            books = bookRepository.findByUserId(userId, pageable);
        }

        return books.map(this::mapToBookResponse);
    }

    @Transactional
    public void deleteBook(Long id, Long userId) {
        log.info("Deleting book with ID: {} for user: {}", id, userId);

        Book book = bookRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ID: " + id));

        long events = readingEventRepository.countByBookIdAndUserId(id, userId);
        if (events > 0) {
            log.info("Deleting {} reading_events for book {} user {}", events, id, userId);
            readingEventRepository.deleteByBookIdAndUserId(id, userId);
        }

        try {
            bookRepository.delete(book);
            log.info("Book deleted successfully with ID: {} for user: {}", id, userId);
        } catch (DataIntegrityViolationException e) {
            log.error("Delete blocked by FK constraints for book {} user {}: {}", id, userId, e.getMessage());
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<String> getAllTags(Long userId) {
        log.info("Fetching distinct tags for user: {}", userId);
        return bookRepository.findDistinctTagsByUserId(userId);
    }

    private BookResponse mapToBookResponse(Book book) {
        List<String> tags = book.getTags() != null ? book.getTags() : List.of();

        return BookResponse.builder()
                .id(book.getId())
                .userBookNo(book.getUserBookNo())
                .googleBooksId(book.getGoogleBooksId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publishedDate(book.getPublishedDate())
                .description(book.getDescription())
                .coverImageUrl(book.getCoverImageUrl())
                .isbn10(book.getIsbn10())
                .isbn13(book.getIsbn13())
                .pageCount(book.getPageCount())
                .tags(tags)
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}