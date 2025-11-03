package com.bookwise.respository;

import com.bookwise.entity.UserBookCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBookCounterRepository extends JpaRepository<UserBookCounter, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "update user_counters set last_book_no = last_book_no + 1 where user_id = :userId", nativeQuery = true)
    int incrementExisting(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "insert into user_counters(user_id, version, last_book_no) values(:userId, 0, 1)", nativeQuery = true)
    int insertFirst(@Param("userId") Long userId);

    @Query(value = "select last_book_no from user_counters where user_id = :userId", nativeQuery = true)
    Integer getLastBookNo(@Param("userId") Long userId);
}