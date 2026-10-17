package com.example.learning.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AiChatDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatRequest {
        private String message;
        private UUID sessionId;
        private String contextLessonTitle;
        private String contextSubject;
        private String mode; // SOCRATIC, GRADE_ADAPTED, PRACTICE, ERROR_DIAGNOSIS, CITE_LESSON
        private Integer gradeLevel; // 1 to 12
        private String studentAnswer;
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
        private String mode;
        private Integer gradeLevel;
        private List<String> stepByStepHints;
        private InteractiveQuizDto interactiveQuiz;
        private List<CitationDto> citations;
        private String misconceptionReason;
        private String safetyWarning;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InteractiveQuizDto {
        private String id;
        private String question;
        private List<String> options;
        private String correctAnswer;
        private String explanation;
        private int points;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CitationDto {
        private String title;
        private String chapter;
        private String sourceBook;
        private String videoTime;
        private String targetUrl;
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
