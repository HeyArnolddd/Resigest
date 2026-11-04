package co.edu.uis.resigest.comunicaciones.dto;

/**
 * Mensaje enviado por WebSocket (STOMP) para el chat en tiempo real.
 */
public record ChatWebSocketMensaje(
        Long remitenteId,
        Long destinatarioId,
        String contenido
) {
}
