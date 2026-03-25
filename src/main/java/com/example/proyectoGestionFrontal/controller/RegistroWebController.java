package com.example.proyectoGestionFrontal.controller;

import com.example.proyectoGestionFrontal.dto.RegistroUsuarioDTO;
import com.example.proyectoGestionFrontal.dto.ActividadDTO;
import com.example.proyectoGestionFrontal.dto.UsuarioDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

@Controller
@RequestMapping("/registros")
public class RegistroWebController {
    
    @Value("${backend.api.url}")
    private String backendUrl;
    
    @Autowired
    private WebClient webClient;
    
    private final String authHeader = "Basic YWRtaW46YWRtaW4xMjM=";
    
    @GetMapping
    public String listarRegistros(Model model) {
        try {
            RegistroUsuarioDTO[] registros = webClient.get()
                .uri(backendUrl + "/registros")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(RegistroUsuarioDTO[].class)
                .block();
            
            ActividadDTO[] actividades = webClient.get()
                .uri(backendUrl + "/actividades")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(ActividadDTO[].class)
                .block();
            
            UsuarioDTO[] usuarios = webClient.get()
                .uri(backendUrl + "/usuarios")
                .header("Authorization", authHeader)
                .retrieve()
                .bodyToMono(UsuarioDTO[].class)
                .block();
            
            model.addAttribute("registros", registros);
            model.addAttribute("actividades", actividades);
            model.addAttribute("usuarios", usuarios);
            model.addAttribute("registro", new RegistroUsuarioDTO());
            
        } catch (Exception e) {
            model.addAttribute("error", "Error al conectar con el backend: " + e.getMessage());
            model.addAttribute("registros", new RegistroUsuarioDTO[0]);
        }
        
        return "registros";
    }
    
    @PostMapping
    public String crearRegistro(@ModelAttribute RegistroUsuarioDTO registro) {
        webClient.post()
            .uri(backendUrl + "/registros")
            .header("Authorization", authHeader)
            .bodyValue(registro)
            .retrieve()
            .bodyToMono(RegistroUsuarioDTO.class)
            .block();
        
        return "redirect:/registros";
    }
    
    @GetMapping("/eliminar/{id}")
    public String eliminarRegistro(@PathVariable Long id) {
        webClient.delete()
            .uri(backendUrl + "/registros/" + id)
            .header("Authorization", authHeader)
            .retrieve()
            .bodyToMono(Void.class)
            .block();
        
        return "redirect:/registros";
    }
}