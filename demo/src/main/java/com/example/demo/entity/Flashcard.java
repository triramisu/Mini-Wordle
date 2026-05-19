package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "flashcards")
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String word;
    private String phonetic;
    private String partOfSpeech;

    @Column(columnDefinition = "TEXT")
    private String meaning; // Nghĩa Tiếng Việt

    @Column(columnDefinition = "TEXT")
    private String englishDefinition; // Định nghĩa Tiếng Anh

    @Column(columnDefinition = "TEXT")
    private String usageExample; // Ví dụ


}
