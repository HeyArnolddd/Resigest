package co.edu.uis.resigest.comunicaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatMensajeRequest(
        @NotNull(message = "El destinatario es obligatorio")
        Long destinatarioId,

        @NotBlank(message = "El contenido es obligatorio")
        @Size(max = 1000, message = "El mensaje no puede superar 1000 caracteres")
        String contenido
) {
}
