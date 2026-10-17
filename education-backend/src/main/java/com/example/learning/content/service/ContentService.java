package com.example.learning.content.service;

import com.example.learning.content.entity.Lesson;
import com.example.learning.content.entity.QuizQuestion;
import com.example.learning.content.repository.LessonRepository;
import com.example.learning.content.repository.QuizRepository;
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
public class ContentService {

    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;

    @Cacheable(value = CacheConfig.CACHE_LESSONS_BY_SUBJECT, key = "#subjectId.toString()")
    public List<Lesson> getLessonsBySubject(UUID subjectId) {
        log.debug("[DB_FETCH] Truy vấn danh sách bài học môn {} từ PostgreSQL", subjectId);
        return lessonRepository.findBySubjectIdAndPublishedTrueOrderByDisplayOrderAsc(subjectId);
    }

    @Cacheable(value = CacheConfig.CACHE_LESSON_DETAIL, key = "#lessonId.toString()")
    public Lesson getLessonById(UUID lessonId) {
        log.debug("[DB_FETCH] Truy vấn chi tiết bài học {} từ PostgreSQL", lessonId);
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài giảng: " + lessonId));
    }

    @Cacheable(value = CacheConfig.CACHE_LESSON_QUIZ, key = "#lessonId.toString()")
    public List<QuizQuestion> getQuizByLesson(UUID lessonId) {
        log.debug("[DB_FETCH] Truy vấn câu hỏi quiz bài học {} từ PostgreSQL", lessonId);
        return quizRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId);
    }

    @Cacheable(value = CacheConfig.CACHE_RECENT_LESSONS, key = "'recent'")
    public List<Lesson> getRecentLessons() {
        log.debug("[DB_FETCH] Truy vấn bài giảng mới nhất từ PostgreSQL");
        return lessonRepository.findRecentPublished();
    }

    @CacheEvict(value = {
            CacheConfig.CACHE_LESSONS_BY_SUBJECT,
            CacheConfig.CACHE_LESSON_DETAIL,
            CacheConfig.CACHE_LESSON_QUIZ,
            CacheConfig.CACHE_RECENT_LESSONS,
            CacheConfig.CACHE_ADMIN_OVERVIEW
    }, allEntries = true)
    public void evictContentCaches() {
        log.info("[CACHE_EVICT] Đã vô hiệu hóa toàn bộ cache nội dung bài học & quiz");
    }
}
