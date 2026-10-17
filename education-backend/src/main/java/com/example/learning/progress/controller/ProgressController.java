package com.example.learning.progress.controller;

import com.example.learning.platform.api.ApiResponse;
import com.example.learning.platform.security.UserPrincipal;
import com.example.learning.progress.dto.ProgressDto;
import com.example.learning.progress.service.ProgressService;
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
@Tag(name = "Learning Progress", description = "Tiến độ học tập và lưu vị trí video")
public class ProgressController {

    private final ProgressService progressService;

    @PutMapping("/lessons/{lessonId}/progress")
    @Operation(summary = "Cập nhật vị trí xem video và tiến độ bài học", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ProgressDto.ProgressResponse>> updateProgress(
            @PathVariable UUID lessonId,
            @RequestBody ProgressDto.UpdateProgressRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để lưu tiến độ"));
        }

        return ResponseEntity.ok(ApiResponse.success(
                progressService.updateProgress(principal.getId(), lessonId, req)));
    }

    @GetMapping("/lessons/{lessonId}/progress")
    @Operation(summary = "Lấy tiến độ xem của bài học hiện tại", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ProgressDto.ProgressResponse>> getLessonProgress(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }

        return ResponseEntity.ok(ApiResponse.success(
                progressService.getProgress(principal.getId(), lessonId).orElse(null)));
    }

    @GetMapping("/progress/summary")
    @Operation(summary = "Tổng quan kết quả học tập của học viên", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ProgressDto.ProgressSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập"));
        }

        return ResponseEntity.ok(ApiResponse.success(
                progressService.getSummary(principal.getId())));
    }

    @PostMapping("/internal/progress/batch-sync")
    @Operation(summary = "Batch Sync nhận nhịp tim học tập gộp từ Golang Live Gateway (Write-Behind Cache)")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> batchSyncProgress(
            @RequestBody java.util.Map<String, Object> req) {

        @SuppressWarnings("unchecked")
        java.util.List<java.util.Map<String, Object>> records = (java.util.List<java.util.Map<String, Object>>) req.get("records");
        int updated = progressService.processBatchSync(records);

        java.util.Map<String, Object> result = java.util.Map.of(
                "updatedCount", updated,
                "message", "Đã đồng bộ thành công " + updated + " bản ghi nhịp tim vào PostgreSQL."
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
