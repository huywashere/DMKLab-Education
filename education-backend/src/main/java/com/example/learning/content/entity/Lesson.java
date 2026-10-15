package com.example.learning.content.entity;

import com.example.learning.academics.entity.Subject;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lessons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Subject subject;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "video_duration_seconds")
    private int videoDurationSeconds;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Builder.Default
    @Column(name = "is_published", nullable = false)
    private boolean published = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
