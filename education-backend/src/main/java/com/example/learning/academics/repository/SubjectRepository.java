package com.example.learning.academics.repository;

import com.example.learning.academics.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findByGradeIdOrderByDisplayOrderAsc(UUID gradeId);
}
