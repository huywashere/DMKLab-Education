package com.example.learning.platform.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<T>(true, "OK", data, Instant.now().toString());
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<T>(true, message, data, Instant.now().toString());
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<T>(false, message, null, Instant.now().toString());
    }
}
