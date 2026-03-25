package com.example.proyectoGestionFrontal.controller;

import com.example.proyectoGestionFrontal.dto.HitoDTO;
import com.example.proyectoGestionFrontal.dto.ProyectoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Controller
@RequestMapping("/hitos")
public class HitoWebController {
    
    @Value("${backend.api.url}")
    private String backendUrl;
    
    @Autowired
    private WebClient webClient;
    
    private final String authHeader = "Basic YWRtaW46YWRtaW4xMjM=";
    
    @GetMapping
    public String listarHitos(Model model) {
        try {
            HitoDTO[] hitos = webClient.get()
                .uri(backendUrl + "/hitos")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(HitoDTO[].class)
                .block();
            
            ProyectoDTO[] proyectos = webClient.get()
                .uri(backendUrl + "/proyectos")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(ProyectoDTO[].class)
                .block();
            
            model.addAttribute("hitos", hitos);
            model.addAttribute("proyectos", proyectos);
            model.addAttribute("hito", new HitoDTO());
            
        } catch (Exception e) {
            model.addAttribute("error", "Error al conectar con el backend: " + e.getMessage());
            model.addAttribute("hitos", new HitoDTO[0]);
        }
        
        return "hitos";
    }
    
    @PostMapping
    public String crearHito(@ModelAttribute HitoDTO hito) {
        webClient.post()
            .uri(backendUrl + "/hitos")
            .header("Authorization", authHeader)
            .bodyValue(hito)
            .retrieve()
            .bodyToMono(HitoDTO.class)
            .block();
        
        return "redirect:/hitos";
    }
    
    @GetMapping("/eliminar/{id}")
    public String eliminarHito(@PathVariable Long id) {
        webClient.delete()
            .uri(backendUrl + "/hitos/" + id)
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(Void.class)
            .block();
        
        return "redirect:/hitos";
    }
}