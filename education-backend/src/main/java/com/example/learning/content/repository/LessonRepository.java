package com.example.learning.content.repository;

import com.example.learning.content.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findBySubjectIdAndPublishedTrueOrderByDisplayOrderAsc(UUID subjectId);

    default List<Lesson> findRecentPublished() {
        return findTop12ByPublishedTrueOrderByCreatedAtDesc();
    }

    List<Lesson> findTop12ByPublishedTrueOrderByCreatedAtDesc();

    long countByPublishedTrue();
}
