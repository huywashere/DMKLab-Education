package com.example.learning.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class ProgressDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProgressRequest {
        private int positionSeconds;
        private int durationSeconds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgressResponse {
        private UUID lessonId;
        private int positionSeconds;
        private boolean isCompleted;
        private String masteryLevel;
        private int energyPointsAwarded;
        private Instant lastAccessedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgressSummaryResponse {
        private long completedLessonsCount;
        private int totalEnergyPoints;
        private int streakDays;
        private String currentRank;
    }
}
