package com.example.learning.progress.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "learning_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "lesson_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LearningProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(name = "position_seconds", nullable = false)
    @Builder.Default
    private int positionSeconds = 0;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean isCompleted = false;

    @Column(name = "mastery_level", nullable = false, length = 20)
    @Builder.Default
    private String masteryLevel = "FAMILIAR"; // NOT_STARTED, FAMILIAR, PROFICIENT, MASTERED

    @Column(name = "last_accessed_at")
    private Instant lastAccessedAt;

    @PrePersist
    @PreUpdate
    protected void onAccess() {
        this.lastAccessedAt = Instant.now();
    }
}
