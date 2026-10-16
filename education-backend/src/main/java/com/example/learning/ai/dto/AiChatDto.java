package com.example.learning.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class AiChatDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private String message;
        private UUID sessionId;
        private String contextLessonTitle;
        private String contextSubject;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatResponse {
        private UUID sessionId;
        private String reply;
        private boolean isSocraticHint;
        private int dailyQuotaRemaining;
        private Instant timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageItem {
        private UUID id;
        private String senderRole;
        private String content;
        private Instant createdAt;
    }
}
