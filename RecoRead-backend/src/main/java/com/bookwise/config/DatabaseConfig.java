package com.bookwise.config;



import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.bookwise.respository")
@EnableTransactionManagement
@Slf4j
public class DatabaseConfig {
    public DatabaseConfig() {
        log.info("Database configuration initialized");
    }
}
