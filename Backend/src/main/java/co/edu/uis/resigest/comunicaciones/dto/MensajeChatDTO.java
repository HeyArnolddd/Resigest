package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.MensajeChat;

import java.time.LocalDateTime;

public record MensajeChatDTO(
        Long id,
        Long remitenteId,
        Long destinatarioId,
        String contenido,
        LocalDateTime fecha
) {

    public static MensajeChatDTO de(MensajeChat mensaje) {
        return new MensajeChatDTO(
                mensaje.getId(),
                mensaje.getRemitente().getId(),
                mensaje.getDestinatario().getId(),
                mensaje.getContenido(),
                mensaje.getFecha()
        );
    }
}
