package co.edu.uis.resigest.comunicaciones.dto;

import java.time.LocalDateTime;

/**
 * Resumen de una conversación privada: con quién y el último mensaje.
 * {@code ultimoEsMio} indica si ese último mensaje lo envió el usuario que consulta.
 */
public record ConversacionDTO(
        Long usuarioId,
        String nombre,
        String detalle,
        String ultimoMensaje,
        LocalDateTime fecha,
        boolean ultimoEsMio
) {
}
