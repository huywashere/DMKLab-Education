package com.example.learning.academics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "subjects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grade_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Grade grade;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(length = 20)
    private String color;

    @Column(length = 50)
    private String icon;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
