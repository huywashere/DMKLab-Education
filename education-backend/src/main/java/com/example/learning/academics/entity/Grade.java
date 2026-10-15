package com.example.learning.academics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "grades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private GradeLevel level;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
