package com.example.learning.ai.repository;

import com.example.learning.ai.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {

    List<ChatSession> findByUserIdAndSessionTypeOrderByCreatedAtDesc(UUID userId, String sessionType);

    Optional<ChatSession> findFirstByUserIdAndSessionTypeOrderByCreatedAtDesc(UUID userId, String sessionType);
}
