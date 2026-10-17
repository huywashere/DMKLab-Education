package com.example.learning.content.service;

import com.example.learning.content.entity.Lesson;
import com.example.learning.content.entity.QuizQuestion;
import com.example.learning.content.repository.LessonRepository;
import com.example.learning.content.repository.QuizRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test: ContentService (Bài giảng Video & Ngân hàng Quiz)")
class ContentServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private ContentService contentService;

    @Test
    @DisplayName("getLessonsBySubject phải lấy danh sách bài học đã xuất bản")
    void shouldReturnPublishedLessons() {
        UUID subjectId = UUID.randomUUID();
        Lesson l1 = Lesson.builder()
                .id(UUID.randomUUID())
                .title("Bài 1: Khái niệm Phân số")
                .published(true)
                .displayOrder(1)
                .build();

        when(lessonRepository.findBySubjectIdAndPublishedTrueOrderByDisplayOrderAsc(subjectId))
                .thenReturn(List.of(l1));

        List<Lesson> lessons = contentService.getLessonsBySubject(subjectId);
        assertNotNull(lessons);
        assertEquals(1, lessons.size());
        assertEquals("Bài 1: Khái niệm Phân số", lessons.get(0).getTitle());
        verify(lessonRepository).findBySubjectIdAndPublishedTrueOrderByDisplayOrderAsc(subjectId);
    }

    @Test
    @DisplayName("getLessonById phải trả về chi tiết bài giảng khi tìm thấy ID")
    void shouldReturnLessonDetailWhenFound() {
        UUID lessonId = UUID.randomUUID();
        Lesson l1 = Lesson.builder()
                .id(lessonId)
                .title("Bài 1: Phân số nâng cao")
                .published(true)
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(l1));

        Lesson result = contentService.getLessonById(lessonId);
        assertNotNull(result);
        assertEquals(lessonId, result.getId());
        verify(lessonRepository).findById(lessonId);
    }

    @Test
    @DisplayName("getLessonById phải ném ngoại lệ RuntimeException khi không tìm thấy bài")
    void shouldThrowExceptionWhenLessonNotFound() {
        UUID randomId = UUID.randomUUID();
        when(lessonRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> contentService.getLessonById(randomId));
    }

    @Test
    @DisplayName("getQuizByLesson phải lấy danh sách câu hỏi trắc nghiệm của bài học")
    void shouldReturnQuizQuestions() {
        UUID lessonId = UUID.randomUUID();
        QuizQuestion q1 = QuizQuestion.builder()
                .id(UUID.randomUUID())
                .question("Phân số 2/4 tối giản là bao nhiêu?")
                .optionA("1/2")
                .optionB("2/3")
                .correctAnswer("A")
                .build();

        when(quizRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId)).thenReturn(List.of(q1));

        List<QuizQuestion> questions = contentService.getQuizByLesson(lessonId);
        assertNotNull(questions);
        assertEquals(1, questions.size());
        assertEquals("1/2", questions.get(0).getOptionA());
        verify(quizRepository).findByLessonIdOrderByDisplayOrderAsc(lessonId);
    }
}
