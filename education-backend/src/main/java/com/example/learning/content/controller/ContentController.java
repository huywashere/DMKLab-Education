package com.example.learning.content.controller;

import com.example.learning.content.entity.Lesson;
import com.example.learning.content.entity.QuizQuestion;
import com.example.learning.content.repository.LessonRepository;
import com.example.learning.content.repository.QuizRepository;
import com.example.learning.platform.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Content", description = "Bài giảng & Quiz")
public class ContentController {

    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;

    @GetMapping("/subjects/{subjectId}/lessons")
    @Operation(summary = "Lấy danh sách bài giảng theo môn học")
    public ResponseEntity<ApiResponse<List<Lesson>>> getLessonsBySubject(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(ApiResponse.success(
                lessonRepository.findBySubjectIdAndPublishedTrueOrderByDisplayOrderAsc(subjectId)));
    }

    @GetMapping("/lessons/{lessonId}")
    @Operation(summary = "Lấy chi tiết bài giảng")
    public ResponseEntity<ApiResponse<Lesson>> getLessonById(@PathVariable UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài giảng: " + lessonId));
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    @GetMapping("/lessons/{lessonId}/quiz")
    @Operation(summary = "Lấy câu hỏi quiz của bài giảng")
    public ResponseEntity<ApiResponse<List<QuizQuestion>>> getQuizByLesson(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(ApiResponse.success(
                quizRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId)));
    }

    @GetMapping("/lessons/recent")
    @Operation(summary = "Lấy danh sách bài giảng mới nhất")
    public ResponseEntity<ApiResponse<List<Lesson>>> getRecentLessons() {
        return ResponseEntity.ok(ApiResponse.success(lessonRepository.findRecentPublished()));
    }
}
