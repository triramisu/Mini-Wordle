package com.example.demo.service.impl;

import com.example.demo.dto.FlashcardDTO;
import com.example.demo.entity.Flashcard;
import com.example.demo.mapper.FlashcardMapper;
import com.example.demo.repository.FlashcardRepository;
import com.example.demo.service.FlashcardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FlashcardServiceImpl implements FlashcardService {

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private FlashcardMapper flashcardMapper;

    @Override
    public List<FlashcardDTO> getAll() {
        return flashcardRepository.findAll().stream()
                .map(flashcardMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public FlashcardDTO addFlashcard(FlashcardDTO flashcardDTO) {
        Optional<Flashcard> existing = flashcardRepository.findByWord(flashcardDTO.getWord());
        if (existing.isPresent()) {
            return flashcardMapper.toDto(existing.get());
        }
        Flashcard flashcard = flashcardMapper.toEntity(flashcardDTO);
        Flashcard savedFlashcard = flashcardRepository.save(flashcard);
        return flashcardMapper.toDto(savedFlashcard);
    }

    @Override
    public void deleteFlashcard(Long id) {
        flashcardRepository.deleteById(id);
    }
}