package com.example.learning.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class AuthDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Tên đăng nhập hoặc email không được để trống")
        private String usernameOrEmail;

        @NotBlank(message = "Mật khẩu không được để trống")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Tên đăng nhập không được để trống")
        @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
        private String username;

        @Email(message = "Email không hợp lệ")
        @NotBlank(message = "Email không được để trống")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        private String password;

        @NotBlank(message = "Họ và tên không được để trống")
        private String fullName;

        private String role = "STUDENT"; // STUDENT, TEACHER, PARENT
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String accessToken;
        private String tokenType;
        private long expiresIn;
        private UserDto user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDto {
        private String id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String avatarUrl;
        private String bio;
        private int energyPoints;
        private int streakDays;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        @NotBlank(message = "Họ và tên không được để trống")
        private String fullName;
        private String avatarUrl;
        private String bio;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "Mật khẩu cũ không được để trống")
        private String oldPassword;

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
        private String newPassword;
    }
}
