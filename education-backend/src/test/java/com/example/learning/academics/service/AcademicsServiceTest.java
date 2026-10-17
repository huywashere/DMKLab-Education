package com.example.learning.academics.service;

import com.example.learning.academics.entity.Grade;
import com.example.learning.academics.entity.GradeLevel;
import com.example.learning.academics.entity.Subject;
import com.example.learning.academics.repository.GradeRepository;
import com.example.learning.academics.repository.SubjectRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test: AcademicsService (Danh mục Khối lớp & Môn học)")
class AcademicsServiceTest {

    @Mock
    private GradeRepository gradeRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private AcademicsService academicsService;

    @Test
    @DisplayName("getAllGrades phải gọi repository và trả về danh sách 12 khối lớp sắp xếp")
    void shouldReturnAllGradesSorted() {
        Grade g5 = Grade.builder()
                .id(UUID.randomUUID())
                .name("Lớp 5")
                .code("GRADE_5")
                .level(GradeLevel.PRIMARY)
                .displayOrder(5)
                .build();

        when(gradeRepository.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of(g5));

        List<Grade> result = academicsService.getAllGrades();
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Lớp 5", result.get(0).getName());
        verify(gradeRepository, times(1)).findAllByOrderByDisplayOrderAsc();
    }

    @Test
    @DisplayName("getSubjectsByGrade phải trả về danh sách môn học của khối lớp tương ứng")
    void shouldReturnSubjectsForGrade() {
        UUID gradeId = UUID.randomUUID();
        Subject math = Subject.builder()
                .id(UUID.randomUUID())
                .name("Toán học")
                .code("MATH_5")
                .displayOrder(1)
                .build();

        when(subjectRepository.findByGradeIdOrderByDisplayOrderAsc(gradeId)).thenReturn(List.of(math));

        List<Subject> result = academicsService.getSubjectsByGrade(gradeId);
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Toán học", result.get(0).getName());
        verify(subjectRepository, times(1)).findByGradeIdOrderByDisplayOrderAsc(gradeId);
    }
}
