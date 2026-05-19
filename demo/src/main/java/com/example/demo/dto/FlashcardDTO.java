package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDTO {
    private Long id;
    private String word;
    private String phonetic;
    private String partOfSpeech;
    private String meaning;
    private String englishDefinition;
    private String usageExample;


}
