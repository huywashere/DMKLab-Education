package com.example.learning.ai.repository;

import com.example.learning.ai.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.sessionId IN (SELECT s.id FROM ChatSession s WHERE s.userId = :userId) AND m.senderRole = 'USER' AND m.createdAt >= :since")
    long countUserMessagesSince(UUID userId, Instant since);
}
