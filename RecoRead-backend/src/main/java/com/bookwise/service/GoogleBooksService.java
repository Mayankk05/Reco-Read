package com.bookwise.service;

import com.bookwise.dto.external.GoogleBookItem;
import com.bookwise.dto.response.SearchResponse;
import com.bookwise.exception.ExternalApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleBooksService {

    private final WebClient webClient;

    @Value("${google.books.api.key}")
    private String apiKey;

    @Value("${google.books.api.url}")
    private String apiUrl;

    public SearchResponse searchBooks(String query, Integer maxResults) {
        log.info("Searching books with query: {}, maxResults: {}", query, maxResults);

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(apiUrl + "/volumes")
                    .queryParam("q", query)
                    .queryParam("maxResults", maxResults != null ? maxResults : 10)
                    .queryParam("key", apiKey)
                    .build()
                    .toUri();

            Map<String, Object> response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null) {
                throw new ExternalApiException("Empty response from Google Books API");
            }

            Integer totalItems = (Integer) response.get("totalItems");
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");

            List<GoogleBookItem> bookItems = items != null ?
                    items.stream()
                            .map(this::mapToGoogleBookItem)
                            .toList() :
                    List.of();

            log.info("Found {} books for query: {}", totalItems, query);

            return SearchResponse.builder()
                    .totalItems(totalItems != null ? totalItems : 0)
                    .items(bookItems)
                    .build();

        } catch (WebClientResponseException e) {
            log.error("Error calling Google Books API: {}", e.getMessage());
            throw new ExternalApiException("Failed to search books: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error searching books: {}", e.getMessage());
            throw new ExternalApiException("Unexpected error occurred while searching books");
        }
    }

    private GoogleBookItem mapToGoogleBookItem(Map<String, Object> item) {
        GoogleBookItem bookItem = new GoogleBookItem();
        bookItem.setId((String) item.get("id"));

        Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");
        if (volumeInfo != null) {
            GoogleBookItem.VolumeInfo volume = new GoogleBookItem.VolumeInfo();

            volume.setTitle((String) volumeInfo.get("title"));
            volume.setAuthors((List<String>) volumeInfo.get("authors"));
            volume.setPublisher((String) volumeInfo.get("publisher"));
            volume.setPublishedDate((String) volumeInfo.get("publishedDate"));
            volume.setDescription((String) volumeInfo.get("description"));
            volume.setPageCount((Integer) volumeInfo.get("pageCount"));
            volume.setCategories((List<String>) volumeInfo.get("categories"));

            Map<String, Object> imageLinks = (Map<String, Object>) volumeInfo.get("imageLinks");
            if (imageLinks != null) {
                GoogleBookItem.VolumeInfo.ImageLinks images = new GoogleBookItem.VolumeInfo.ImageLinks();
                images.setThumbnail((String) imageLinks.get("thumbnail"));
                images.setSmall((String) imageLinks.get("small"));
                images.setMedium((String) imageLinks.get("medium"));
                images.setLarge((String) imageLinks.get("large"));
                volume.setImageLinks(images);
            }

            List<Map<String, Object>> industryIdentifiers = (List<Map<String, Object>>) volumeInfo.get("industryIdentifiers");
            if (industryIdentifiers != null) {
                List<GoogleBookItem.VolumeInfo.IndustryIdentifier> identifiers = industryIdentifiers.stream()
                        .map(identifier -> {
                            GoogleBookItem.VolumeInfo.IndustryIdentifier id = new GoogleBookItem.VolumeInfo.IndustryIdentifier();
                            id.setType((String) identifier.get("type"));
                            id.setIdentifier((String) identifier.get("identifier"));
                            return id;
                        })
                        .toList();
                volume.setIndustryIdentifiers(identifiers);
            }

            bookItem.setVolumeInfo(volume);
        }

        return bookItem;
    }
}
