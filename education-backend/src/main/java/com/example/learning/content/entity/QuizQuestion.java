package com.example.learning.content.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "quiz_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Lesson lesson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "option_a", nullable = false, length = 500)
    private String optionA;

    @Column(name = "option_b", nullable = false, length = 500)
    private String optionB;

    @Column(name = "option_c", length = 500)
    private String optionC;

    @Column(name = "option_d", length = 500)
    private String optionD;

    @Column(name = "correct_answer", nullable = false, length = 1)
    private String correctAnswer; // A, B, C, or D

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "display_order")
    private int displayOrder;
}
