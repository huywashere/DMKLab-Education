package com.example.learning.progress.repository;

import com.example.learning.progress.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, UUID> {

    Optional<LearningProgress> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    List<LearningProgress> findByUserId(UUID userId);

    long countByUserIdAndIsCompletedTrue(UUID userId);

    long countByIsCompletedTrue();
}
