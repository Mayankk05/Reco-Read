package com.bookwise.dto.response;



import com.bookwise.dto.external.GoogleBookItem;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SearchResponse {

    private Integer totalItems;
    private List<GoogleBookItem> items;
}
