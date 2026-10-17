package com.example.learning.platform.security;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class InputSanitizer {

    private static final Pattern SCRIPT_PATTERN = Pattern.compile(
            "<\\s*script[^>]*>(.*?)<\\s*/\\s*script\\s*>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    private static final Pattern TAG_PATTERN = Pattern.compile(
            "<\\s*(iframe|object|embed|applet|meta|link|style)[^>]*>.*?(<\\s*/\\s*\\1\\s*>)?", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile(
            "\\b(on\\w+)\\s*=\\s*(\"|')?[^\"'>]*(\"|')?", Pattern.CASE_INSENSITIVE);

    private static final Pattern JAVASCRIPT_PROTOCOL_PATTERN = Pattern.compile(
            "javascript\\s*:", Pattern.CASE_INSENSITIVE);

    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            "('\\s*(OR|AND)\\s*['\"\\d]+=)|(UNION\\s+SELECT)|(;\\s*DROP\\s+TABLE)|(--\\s*$)", Pattern.CASE_INSENSITIVE);

    /**
     * Khử độc chuỗi đầu vào (Sanitize), loại bỏ hoàn toàn các thẻ và thuộc tính nguy hiểm
     */
    public static String sanitize(String input) {
        if (input == null) return null;

        String cleaned = input;
        cleaned = SCRIPT_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = TAG_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = EVENT_HANDLER_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = JAVASCRIPT_PROTOCOL_PATTERN.matcher(cleaned).replaceAll("");

        // Chuyển đổi các ký tự điều khiển nguy hiểm còn sót lại
        cleaned = cleaned.replace("<script", "&lt;script")
                         .replace("</script", "&lt;/script")
                         .replace("<iframe", "&lt;iframe")
                         .replace("javascript:", "blocked:");

        return cleaned.trim();
    }

    /**
     * Kiểm tra xem chuỗi có chứa vector tấn công XSS hoặc SQL Injection hay không
     */
    public static boolean containsMaliciousPayload(String input) {
        if (input == null || input.isBlank()) return false;
        return SCRIPT_PATTERN.matcher(input).find()
                || TAG_PATTERN.matcher(input).find()
                || EVENT_HANDLER_PATTERN.matcher(input).find()
                || JAVASCRIPT_PROTOCOL_PATTERN.matcher(input).find()
                || SQL_INJECTION_PATTERN.matcher(input).find();
    }
}
