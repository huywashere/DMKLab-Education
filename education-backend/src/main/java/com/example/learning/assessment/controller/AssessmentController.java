package com.example.learning.assessment.controller;

import com.example.learning.assessment.dto.QuizSubmissionDto;
import com.example.learning.assessment.service.AssessmentService;
import com.example.learning.platform.api.ApiResponse;
import com.example.learning.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Assessment", description = "Làm bài kiểm tra & Chấm điểm trắc nghiệm")
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping("/lessons/{lessonId}/quiz/submit")
    @Operation(summary = "Nộp bài trắc nghiệm và nhận điểm số + giải thích chi tiết", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<QuizSubmissionDto.QuizSubmissionResponse>> submitQuiz(
            @PathVariable UUID lessonId,
            @RequestBody QuizSubmissionDto.QuizSubmissionRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal != null ? principal.getId() : null;
        QuizSubmissionDto.QuizSubmissionResponse response = assessmentService.evaluateQuiz(userId, lessonId, req);

        return ResponseEntity.ok(ApiResponse.success("Chấm điểm hoàn tất", response));
    }
}
