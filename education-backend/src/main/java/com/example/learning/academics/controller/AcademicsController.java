package com.example.learning.academics.controller;

import com.example.learning.academics.entity.Grade;
import com.example.learning.academics.entity.Subject;
import com.example.learning.academics.service.AcademicsService;
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
@Tag(name = "Academics", description = "Khối lớp & Môn học (Đã tích hợp Redis Multi-Level Caching)")
public class AcademicsController {

    private final AcademicsService academicsService;

    @GetMapping("/grades")
    @Operation(summary = "Lấy danh sách tất cả 12 khối lớp (Được cache 24h)")
    public ResponseEntity<ApiResponse<List<Grade>>> getAllGrades() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                .body(ApiResponse.success(academicsService.getAllGrades()));
    }

    @GetMapping("/grades/{gradeId}/subjects")
    @Operation(summary = "Lấy danh sách môn học theo khối lớp (Được cache 12h)")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByGrade(@PathVariable UUID gradeId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.MINUTES).cachePublic())
                .body(ApiResponse.success(academicsService.getSubjectsByGrade(gradeId)));
    }
}
