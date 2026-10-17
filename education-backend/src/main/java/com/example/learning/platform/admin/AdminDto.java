package com.example.learning.platform.admin;

import com.example.learning.identity.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class AdminDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewReport {
        private long totalUsers;
        private long totalStudents;
        private long totalTeachers;
        private long totalLessons;
        private long totalQuizzesCompleted;
        private long totalEnergyPoints;
        private long activeUsersToday;
        private long storageUsedBytes;
        private double cdnCacheHitRate;
        private double aiMonthlyCostUsd;
        private double aiMonthlyQuotaUsd;
        private long jvmMemoryUsedMb;
        private long jvmMemoryMaxMb;
        private String postgresStatus;
        private String flywayStatus;
        private String redisStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUserItem {
        private UUID id;
        private String username;
        private String email;
        private String fullName;
        private UserRole role;
        private boolean active;
        private int energyPoints;
        private int streakDays;
        private String bio;
        private String avatarUrl;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        private boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadUrlRequest {
        private String filename;
        private String contentType;
        private Long fileSizeBytes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadUrlResponse {
        private String uploadUrl;
        private String storageKey;
        private String publicCdnUrl;
        private int expiresInSeconds;
        private String hlsStreamingUrl;
        private String provider;
        private boolean isLiveConfigured;
        private String message;
    }
}
