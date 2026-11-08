package com.example.learning.assessment.service;

import com.example.learning.assessment.dto.QuizSubmissionDto;
import com.example.learning.content.entity.Lesson;
import com.example.learning.content.entity.QuizQuestion;
import com.example.learning.content.repository.QuizRepository;
import com.example.learning.identity.entity.User;
import com.example.learning.identity.repository.UserRepository;
import com.example.learning.progress.entity.LearningProgress;
import com.example.learning.progress.repository.LearningProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit & Concurrency Test: AssessmentService (Chấm điểm Quiz & Chống Race Condition)")
class AssessmentConcurrencyTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private LearningProgressRepository progressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AssessmentService assessmentService;

    private UUID userId;
    private UUID lessonId;
    private List<QuizQuestion> mockQuestions;
    private User mockUser;
    private Lesson mockLesson;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        lessonId = UUID.randomUUID();

        mockLesson = Lesson.builder()
                .id(lessonId)
                .title("Bài 1: Mệnh đề toán học")
                .build();

        UUID q1Id = UUID.randomUUID();
        UUID q2Id = UUID.randomUUID();
        UUID q3Id = UUID.randomUUID();

        mockQuestions = List.of(
                QuizQuestion.builder()
                        .id(q1Id)
                        .lesson(mockLesson)
                        .question("Mệnh đề nào đúng?")
                        .correctAnswer("B")
                        .explanation("Giải thích 1")
                        .displayOrder(1)
                        .build(),
                QuizQuestion.builder()
                        .id(q2Id)
                        .lesson(mockLesson)
                        .question("Phủ định của mệnh đề là gì?")
                        .correctAnswer("A")
                        .explanation("Giải thích 2")
                        .displayOrder(2)
                        .build(),
                QuizQuestion.builder()
                        .id(q3Id)
                        .lesson(mockLesson)
                        .question("Tính chất bắc cầu?")
                        .correctAnswer("C")
                        .explanation("Giải thích 3")
                        .displayOrder(3)
                        .build()
        );

        mockUser = User.builder()
                .id(userId)
                .username("student_an")
                .energyPoints(1000)
                .build();
    }

    @Test
    @DisplayName("Nộp bài đúng 100% phải đạt chuẩn MASTERED và cộng 100 điểm năng lượng")
    void shouldEvaluatePerfectQuizAndAwardPoints() {
        when(quizRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId)).thenReturn(mockQuestions);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(progressRepository.findByUserIdAndLessonId(userId, lessonId)).thenReturn(Optional.empty());

        QuizSubmissionDto.QuizSubmissionRequest request = new QuizSubmissionDto.QuizSubmissionRequest(List.of(
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(0).getId(), "B"),
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(1).getId(), "A"),
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(2).getId(), "C")
        ));

        QuizSubmissionDto.QuizSubmissionResponse response = assessmentService.evaluateQuiz(userId, lessonId, request);

        assertNotNull(response);
        assertEquals(3, response.getTotalQuestions());
        assertEquals(3, response.getCorrectAnswersCount());
        assertEquals(100, response.getScorePercentage());
        assertTrue(response.isPassed());
        assertEquals(100, response.getEnergyPointsAwarded());

        verify(userRepository, times(1)).save(argThat(u -> u.getEnergyPoints() == 1100));
        verify(progressRepository, times(1)).save(argThat(p -> p.isCompleted() && "MASTERED".equals(p.getMasteryLevel())));
    }

    @Test
    @DisplayName("Nộp bài đúng 2/3 (67%) chưa đạt ngưỡng 80% không được cộng năng lượng")
    void shouldFailQuizWhenBelowPassingThreshold() {
        when(quizRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId)).thenReturn(mockQuestions);

        QuizSubmissionDto.QuizSubmissionRequest request = new QuizSubmissionDto.QuizSubmissionRequest(List.of(
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(0).getId(), "B"),
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(1).getId(), "A"),
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(2).getId(), "D") // Sai
        ));

        QuizSubmissionDto.QuizSubmissionResponse response = assessmentService.evaluateQuiz(userId, lessonId, request);

        assertNotNull(response);
        assertEquals(3, response.getTotalQuestions());
        assertEquals(2, response.getCorrectAnswersCount());
        assertEquals(67, response.getScorePercentage());
        assertFalse(response.isPassed());
        assertEquals(0, response.getEnergyPointsAwarded());

        verify(userRepository, never()).save(any());
        verify(progressRepository, never()).save(any());
    }

    @Test
    @DisplayName("Kiểm thử đa luồng đồng thời (Concurrency Test) - Đảm bảo tính toán độc lập và an toàn")
    void shouldHandleConcurrentQuizSubmissionsResiliently() throws InterruptedException {
        when(quizRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId)).thenReturn(mockQuestions);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(progressRepository.findByUserIdAndLessonId(userId, lessonId)).thenReturn(Optional.empty());

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        QuizSubmissionDto.QuizSubmissionRequest request = new QuizSubmissionDto.QuizSubmissionRequest(List.of(
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(0).getId(), "B"),
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(1).getId(), "A"),
                new QuizSubmissionDto.AnswerItem(mockQuestions.get(2).getId(), "C")
        ));

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    QuizSubmissionDto.QuizSubmissionResponse res = assessmentService.evaluateQuiz(userId, lessonId, request);
                    if (res != null && res.isPassed()) {
                        successCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean finishedInTime = latch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finishedInTime, "Tất cả các luồng nộp bài phải kết thúc trong vòng 5 giây");
        assertEquals(threadCount, successCount.get(), "Tất cả 10 luồng phải hoàn thành đánh giá thành công");
    }
}
