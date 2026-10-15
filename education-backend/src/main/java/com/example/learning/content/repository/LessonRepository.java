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

    @Query("SELECT l FROM Lesson l WHERE l.published = true ORDER BY l.createdAt DESC")
    List<Lesson> findRecentPublished();
}
