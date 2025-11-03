package com.bookwise.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

public class LocalDateFlexibleDeserializer extends JsonDeserializer<LocalDate> {
    private static final DateTimeFormatter D = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter M = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter Y = DateTimeFormatter.ofPattern("yyyy");

    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String raw = p.getValueAsString();
        if (raw == null || raw.isBlank()) return null;
        raw = raw.trim();
        try {
            if (raw.length() == 10) return LocalDate.parse(raw, D);
            if (raw.length() == 7)  return YearMonth.parse(raw, M).atDay(1);
            if (raw.length() == 4)  return Year.parse(raw, Y).atMonth(1).atDay(1);
            return LocalDate.parse(raw); // final fallback
        } catch (Exception e) {
            throw ctxt.weirdStringException(raw, LocalDate.class, "Expected yyyy, yyyy-MM, or yyyy-MM-dd");
        }
    }
}