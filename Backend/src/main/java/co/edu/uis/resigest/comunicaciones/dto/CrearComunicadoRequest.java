package co.edu.uis.resigest.comunicaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearComunicadoRequest(
        @NotBlank(message = "El título es obligatorio")
        @Size(max = 200, message = "El título no puede superar 200 caracteres")
        String titulo,

        @NotBlank(message = "El cuerpo es obligatorio")
        @Size(max = 2000, message = "El cuerpo no puede superar 2000 caracteres")
        String cuerpo,

        @Size(max = 500, message = "La URL del adjunto no puede superar 500 caracteres")
        String urlAdjunto
) {
}
