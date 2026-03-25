package com.example.proyectoGestionFrontal.controller;

import com.example.proyectoGestionFrontal.dto.ProyectoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Controller
@RequestMapping("/proyectos")
public class ProyectoWebController {
    
    @Value("${backend.api.url}")
    private String backendUrl;
    
    @Autowired
    private WebClient webClient;
    
    private final String authHeader = "Basic YWRtaW46YWRtaW4xMjM=";
    
    @GetMapping
    public String listarProyectos(Model model) {
        try {
            ProyectoDTO[] proyectos = webClient.get()
                .uri(backendUrl + "/proyectos")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(ProyectoDTO[].class)
                .block();
            
            model.addAttribute("proyectos", proyectos);
            model.addAttribute("proyecto", new ProyectoDTO());
            
        } catch (Exception e) {
            model.addAttribute("error", "Error al conectar con el backend: " + e.getMessage());
            model.addAttribute("proyectos", new ProyectoDTO[0]);
        }
        
        return "proyectos";
    }
    
    @PostMapping
    public String crearProyecto(@ModelAttribute ProyectoDTO proyecto) {
        webClient.post()
            .uri(backendUrl + "/proyectos")
            .header("Authorization", authHeader)
            .bodyValue(proyecto)
            .retrieve()
            .bodyToMono(ProyectoDTO.class)
            .block();
        
        return "redirect:/proyectos";
    }
    
    @GetMapping("/eliminar/{id}")
    public String eliminarProyecto(@PathVariable Long id) {
        webClient.delete()
            .uri(backendUrl + "/proyectos/" + id)
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(Void.class)
            .block();
        
        return "redirect:/proyectos";
    }
}