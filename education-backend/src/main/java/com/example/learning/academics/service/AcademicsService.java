package com.example.learning.academics.service;

import com.example.learning.academics.entity.Grade;
import com.example.learning.academics.entity.Subject;
import com.example.learning.academics.repository.GradeRepository;
import com.example.learning.academics.repository.SubjectRepository;
import com.example.learning.platform.config.CacheConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicsService {

    private final GradeRepository gradeRepository;
    private final SubjectRepository subjectRepository;

    @Cacheable(value = CacheConfig.CACHE_GRADES, key = "'all'")
    public List<Grade> getAllGrades() {
        log.debug("[DB_FETCH] Truy vấn danh sách 12 khối lớp từ PostgreSQL");
        return gradeRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Cacheable(value = CacheConfig.CACHE_SUBJECTS, key = "#gradeId.toString()")
    public List<Subject> getSubjectsByGrade(UUID gradeId) {
        log.debug("[DB_FETCH] Truy vấn môn học cho khối lớp {} từ PostgreSQL", gradeId);
        return subjectRepository.findByGradeIdOrderByDisplayOrderAsc(gradeId);
    }

    @CacheEvict(value = {CacheConfig.CACHE_GRADES, CacheConfig.CACHE_SUBJECTS}, allEntries = true)
    public void evictAcademicsCache() {
        log.info("[CACHE_EVICT] Đã xóa cache danh mục khối lớp và môn học");
    }
}
