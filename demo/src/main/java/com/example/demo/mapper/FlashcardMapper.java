package com.example.demo.mapper;

import com.example.demo.dto.FlashcardDTO;
import com.example.demo.entity.Flashcard;
import org.springframework.stereotype.Component;

@Component
public class FlashcardMapper {

    public FlashcardDTO toDto(Flashcard entity) {
        if (entity == null) {
            return null;
        }
        return new FlashcardDTO(entity.getId(), entity.getWord());
    }

    public Flashcard toEntity(FlashcardDTO dto) {
        if (dto == null) {
            return null;
        }
        Flashcard entity = new Flashcard();
        entity.setId(dto.getId());
        entity.setWord(dto.getWord());
        return entity;
    }
}