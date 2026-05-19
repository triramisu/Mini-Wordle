package com.example.demo.service;

import com.example.demo.dto.FlashcardDTO;
import java.util.List;

public interface FlashcardService {
    List<FlashcardDTO> getAll();
    FlashcardDTO addFlashcard(FlashcardDTO flashcardDTO);
    void deleteFlashcard(Long id);
}