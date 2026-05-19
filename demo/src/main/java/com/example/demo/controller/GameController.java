package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GameController {
    @GetMapping("/")
    public String index() {
        return "index"; // Trả về file templates/index.html
    }
}