package com.example.proyectoGestionFrontal.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroUsuarioDTO {

    private Long usuarioId;

    private Long actividadId;

    private LocalDate fechaRegistro;

    private Double horasTrabajadas;

}