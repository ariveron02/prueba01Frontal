package com.example.proyectoGestionFrontal.controller;

import com.example.proyectoGestionFrontal.dto.UsuarioDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Controller
@RequestMapping("/usuarios")
public class UsuarioWebController {
    
    @Value("${backend.api.url}")
    private String backendUrl;
    
    @Autowired
    private WebClient webClient;
    
    private final String authHeader = "Basic YWRtaW46YWRtaW4xMjM=";
    
    
    @GetMapping
    public String listarUsuarios(Model model) {
        try {
            UsuarioDTO[] usuarios = webClient.get()
                .uri(backendUrl + "/usuarios")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(UsuarioDTO[].class)
                .block();
            
            model.addAttribute("usuarios", usuarios);
            model.addAttribute("usuario", new UsuarioDTO());
            
        } catch (Exception e) {
            model.addAttribute("error", "Error al conectar con el backend: " + e.getMessage());
            model.addAttribute("usuarios", new UsuarioDTO[0]);
        }
        
        return "usuarios";
    }
    
    @PostMapping
    public String crearUsuario(@ModelAttribute UsuarioDTO usuario) {
        webClient.post()
            .uri(backendUrl + "/usuarios")
            .header("Authorization", authHeader)
            .bodyValue(usuario)
            .retrieve()
            .bodyToMono(UsuarioDTO.class)
            .block();
        
        return "redirect:/usuarios";
    }
    
    @GetMapping("/eliminar/{id}")
    public String eliminarUsuario(@PathVariable Long id) {
        webClient.delete()
            .uri(backendUrl + "/usuarios/" + id)
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(Void.class)
            .block();
        
        return "redirect:/usuarios";
    }
}