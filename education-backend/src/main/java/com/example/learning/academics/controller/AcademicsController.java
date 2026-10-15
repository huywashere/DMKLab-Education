package com.example.learning.academics.controller;

import com.example.learning.academics.entity.Grade;
import com.example.learning.academics.entity.Subject;
import com.example.learning.academics.repository.GradeRepository;
import com.example.learning.academics.repository.SubjectRepository;
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
@Tag(name = "Academics", description = "Khối lớp & Môn học")
public class AcademicsController {

    private final GradeRepository gradeRepository;
    private final SubjectRepository subjectRepository;

    @GetMapping("/grades")
    @Operation(summary = "Lấy danh sách tất cả 12 khối lớp")
    public ResponseEntity<ApiResponse<List<Grade>>> getAllGrades() {
        return ResponseEntity.ok(ApiResponse.success(gradeRepository.findAllByOrderByDisplayOrderAsc()));
    }

    @GetMapping("/grades/{gradeId}/subjects")
    @Operation(summary = "Lấy danh sách môn học theo khối lớp")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByGrade(@PathVariable UUID gradeId) {
        return ResponseEntity.ok(ApiResponse.success(subjectRepository.findByGradeIdOrderByDisplayOrderAsc(gradeId)));
    }
}
