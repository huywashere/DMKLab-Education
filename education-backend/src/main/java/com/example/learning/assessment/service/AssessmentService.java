package com.example.learning.assessment.service;

import com.example.learning.assessment.dto.QuizSubmissionDto;
import com.example.learning.content.entity.QuizQuestion;
import com.example.learning.content.repository.QuizRepository;
import com.example.learning.identity.repository.UserRepository;
import com.example.learning.progress.entity.LearningProgress;
import com.example.learning.progress.repository.LearningProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final QuizRepository quizRepository;
    private final LearningProgressRepository progressRepository;
    private final UserRepository userRepository;

    @Transactional
    public QuizSubmissionDto.QuizSubmissionResponse evaluateQuiz(
            UUID userId,
            UUID lessonId,
            QuizSubmissionDto.QuizSubmissionRequest req) {

        List<QuizQuestion> questions = quizRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId);
        if (questions.isEmpty()) {
            throw new RuntimeException("Bài học này chưa có câu hỏi trắc nghiệm.");
        }

        Map<UUID, String> userAnswers = new HashMap<>();
        if (req != null && req.getAnswers() != null) {
            for (QuizSubmissionDto.AnswerItem item : req.getAnswers()) {
                if (item.getQuestionId() != null && item.getSelectedOption() != null) {
                    userAnswers.put(item.getQuestionId(), item.getSelectedOption().trim().toUpperCase());
                }
            }
        }

        int correctCount = 0;
        List<QuizSubmissionDto.QuestionFeedback> feedbackList = new ArrayList<>();

        for (QuizQuestion q : questions) {
            String userAns = userAnswers.getOrDefault(q.getId(), "");
            boolean isCorrect = userAns.equalsIgnoreCase(q.getCorrectAnswer());
            if (isCorrect) {
                correctCount++;
            }

            feedbackList.add(QuizSubmissionDto.QuestionFeedback.builder()
                    .questionId(q.getId())
                    .question(q.getQuestion())
                    .selectedOption(userAns)
                    .correctAnswer(q.getCorrectAnswer())
                    .isCorrect(isCorrect)
                    .explanation(q.getExplanation())
                    .build());
        }

        int total = questions.size();
        int scorePercentage = (int) Math.round(((double) correctCount / total) * 100);
        boolean isPassed = scorePercentage >= 80;

        int energyAwarded = 0;
        if (isPassed) {
            energyAwarded = 100;

            // Update user energy points
            if (userId != null) {
                userRepository.findById(userId).ifPresent(user -> {
                    user.setEnergyPoints(user.getEnergyPoints() + 100);
                    userRepository.save(user);
                });

                // Update learning progress
                LearningProgress progress = progressRepository.findByUserIdAndLessonId(userId, lessonId)
                        .orElseGet(() -> LearningProgress.builder()
                                .userId(userId)
                                .lessonId(lessonId)
                                .positionSeconds(0)
                                .isCompleted(false)
                                .build());

                progress.setCompleted(true);
                progress.setMasteryLevel(scorePercentage == 100 ? "MASTERED" : "PROFICIENT");
                progressRepository.save(progress);
            }
        }

        String message = isPassed
                ? "Xuất sắc! Bạn đã vượt qua bài trắc nghiệm với " + scorePercentage + "% điểm."
                : "Bạn đạt " + scorePercentage + "%. Hãy xem lại bài giảng và thử sức lần nữa nhé!";

        return QuizSubmissionDto.QuizSubmissionResponse.builder()
                .totalQuestions(total)
                .correctAnswersCount(correctCount)
                .scorePercentage(scorePercentage)
                .isPassed(isPassed)
                .energyPointsAwarded(energyAwarded)
                .feedbackMessage(message)
                .details(feedbackList)
                .build();
    }
}
