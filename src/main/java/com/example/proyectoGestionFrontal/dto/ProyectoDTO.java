package com.example.proyectoGestionFrontal.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class ProyectoDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private Set<Long> usuariosAsignadosIds;

}