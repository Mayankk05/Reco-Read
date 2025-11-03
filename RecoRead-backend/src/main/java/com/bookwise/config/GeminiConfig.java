package com.bookwise.config;



import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Bean
    public RestTemplate geminiRestTemplate() {
        return new RestTemplate();
    }
    @Bean
    public GeminiProperties geminiProperties() {
        return new GeminiProperties(geminiApiKey, geminiApiUrl);
    }

    public static class GeminiProperties {
        private final String apiKey;
        private final String apiUrl;

        public GeminiProperties(String apiKey, String apiUrl) {
            this.apiKey = apiKey;
            this.apiUrl = apiUrl;
        }

        public String getApiKey() { return apiKey; }
        public String getApiUrl() { return apiUrl; }
    }
}
