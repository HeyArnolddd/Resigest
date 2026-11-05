package co.edu.uis.resigest.mantenimiento.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Respuesta de quien reportó la incidencia: si quedó solucionada o no (y por qué).
 */
public record ConfirmarSolucionRequest(
        @NotNull(message = "Indica si el problema quedó solucionado")
        Boolean solucionado,

        @Size(max = 500, message = "El comentario no puede superar 500 caracteres")
        String comentario
) {
}
