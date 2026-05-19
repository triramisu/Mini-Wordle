package com.example.demo.controller;

import com.example.demo.dto.FlashcardDTO;
import com.example.demo.service.FlashcardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    @Autowired
    private FlashcardService flashcardService;

    @GetMapping
    public List<FlashcardDTO> getAll() {
        return flashcardService.getAll();
    }

    @PostMapping
    public ResponseEntity<FlashcardDTO> addFlashcard(@RequestBody FlashcardDTO flashcardDTO) {
        return ResponseEntity.ok(flashcardService.addFlashcard(flashcardDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long id) {
        flashcardService.deleteFlashcard(id);
        return ResponseEntity.ok().build();
    }
}