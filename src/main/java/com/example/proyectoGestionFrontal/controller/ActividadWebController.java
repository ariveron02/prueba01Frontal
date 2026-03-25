package com.example.proyectoGestionFrontal.controller;

import com.example.proyectoGestionFrontal.dto.ActividadDTO;
import com.example.proyectoGestionFrontal.dto.HitoDTO;
import com.example.proyectoGestionFrontal.dto.UsuarioDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Controller  
@RequestMapping("/actividades")
public class ActividadWebController {
    
    @Value("${backend.api.url}")
    private String backendUrl;
    
    @Autowired
    private WebClient webClient;
    
    private final String authHeader = "Basic YWRtaW46YWRtaW4xMjM=";
    
    @GetMapping
    public String listarActividades(Model model) {

        ActividadDTO[] actividades = webClient.get()
            .uri(backendUrl + "/actividades")
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(ActividadDTO[].class)
            .block();
        
        // Obtener hitos para el select del formulario
        HitoDTO[] hitos = webClient.get()
            .uri(backendUrl + "/hitos")
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(HitoDTO[].class)
            .block();
        
        // Obtener usuarios para el select del formulario
        UsuarioDTO[] usuarios = webClient.get()
            .uri(backendUrl + "/usuarios")
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(UsuarioDTO[].class)
            .block();
        
        model.addAttribute("actividades", actividades);
        model.addAttribute("hitos", hitos);
        model.addAttribute("usuarios", usuarios);
        model.addAttribute("actividad", new ActividadDTO());
        
        return "actividades";  // ← Retorna la vista HTML
    }
    
    // POST - Crear actividad (redirige a la lista)
    @PostMapping
    public String crearActividad(@ModelAttribute ActividadDTO actividad) {
        webClient.post()
            .uri(backendUrl + "/actividades")
            .header("Authorization", authHeader)
            .bodyValue(actividad)
            .retrieve()
            .bodyToMono(ActividadDTO.class)
            .block();
        
        return "redirect:/actividades";
    }
    
    // GET - Eliminar actividad
    @GetMapping("/eliminar/{id}")
    public String eliminarActividad(@PathVariable Long id) {
        webClient.delete()
            .uri(backendUrl + "/actividades/" + id)
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(Void.class)
            .block();
        
        return "redirect:/actividades";
    }
}