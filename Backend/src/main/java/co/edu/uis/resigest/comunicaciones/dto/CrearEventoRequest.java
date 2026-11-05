package co.edu.uis.resigest.comunicaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CrearEventoRequest(
        @NotBlank(message = "El título es obligatorio")
        @Size(max = 200, message = "El título no puede superar 200 caracteres")
        String titulo,

        @Size(max = 1000, message = "La descripción no puede superar 1000 caracteres")
        String descripcion,

        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime fecha,

        @Size(max = 200, message = "El lugar no puede superar 200 caracteres")
        String lugar,

        @Size(max = 30, message = "El tipo no puede superar 30 caracteres")
        String tipo
) {
}
