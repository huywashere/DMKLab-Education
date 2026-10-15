package com.example.learning.content.repository;

import com.example.learning.content.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByLessonIdOrderByDisplayOrderAsc(UUID lessonId);
}
