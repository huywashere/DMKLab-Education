package com.example.learning.content.controller;

import com.example.learning.content.entity.Lesson;
import com.example.learning.content.entity.QuizQuestion;
import com.example.learning.content.service.ContentService;
import com.example.learning.platform.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Content", description = "Bài giảng & Quiz (Đã tích hợp Redis Multi-Level Caching)")
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/subjects/{subjectId}/lessons")
    @Operation(summary = "Lấy danh sách bài giảng theo môn học (Cache 2h)")
    public ResponseEntity<ApiResponse<List<Lesson>>> getLessonsBySubject(@PathVariable UUID subjectId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES).cachePublic())
                .body(ApiResponse.success(contentService.getLessonsBySubject(subjectId)));
    }

    @GetMapping("/lessons/{lessonId}")
    @Operation(summary = "Lấy chi tiết bài giảng (Cache 2h)")
    public ResponseEntity<ApiResponse<Lesson>> getLessonById(@PathVariable UUID lessonId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES).cachePublic())
                .body(ApiResponse.success(contentService.getLessonById(lessonId)));
    }

    @GetMapping("/lessons/{lessonId}/quiz")
    @Operation(summary = "Lấy câu hỏi quiz của bài giảng (Cache 2h)")
    public ResponseEntity<ApiResponse<List<QuizQuestion>>> getQuizByLesson(@PathVariable UUID lessonId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(15, TimeUnit.MINUTES).cachePublic())
                .body(ApiResponse.success(contentService.getQuizByLesson(lessonId)));
    }

    @GetMapping("/lessons/recent")
    @Operation(summary = "Lấy danh sách bài giảng mới nhất (Cache 15m)")
    public ResponseEntity<ApiResponse<List<Lesson>>> getRecentLessons() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(ApiResponse.success(contentService.getRecentLessons()));
    }
}
