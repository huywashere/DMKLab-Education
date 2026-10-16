package com.example.learning.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

public class QuizSubmissionDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerItem {
        private UUID questionId;
        private String selectedOption; // A, B, C, D
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizSubmissionRequest {
        private List<AnswerItem> answers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionFeedback {
        private UUID questionId;
        private String question;
        private String selectedOption;
        private String correctAnswer;
        private boolean isCorrect;
        private String explanation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizSubmissionResponse {
        private int totalQuestions;
        private int correctAnswersCount;
        private int scorePercentage;
        private boolean isPassed;
        private int energyPointsAwarded;
        private String feedbackMessage;
        private List<QuestionFeedback> details;
    }
}
