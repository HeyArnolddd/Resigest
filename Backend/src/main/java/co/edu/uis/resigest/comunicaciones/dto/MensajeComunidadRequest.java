package co.edu.uis.resigest.comunicaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MensajeComunidadRequest(
        @NotBlank(message = "El mensaje no puede estar vacío")
        @Size(max = 1000, message = "El mensaje no puede superar 1000 caracteres")
        String contenido,

        /** null = chat general; si no, el chat de esa torre. */
        Long torreId
) {
}
