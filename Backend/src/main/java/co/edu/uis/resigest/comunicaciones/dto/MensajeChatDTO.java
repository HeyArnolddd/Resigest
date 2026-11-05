package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.MensajeChat;
import co.edu.uis.resigest.usuarios.domain.Residente;
import org.hibernate.Hibernate;

import java.time.LocalDateTime;

/** {@code destinatarioId} es null en los mensajes del chat comunitario. */
public record MensajeChatDTO(
        Long id,
        Long remitenteId,
        String remitenteNombre,
        String remitenteApartamento,
        Long destinatarioId,
        String contenido,
        LocalDateTime fecha
) {

    /** Debe llamarse dentro de una transacción (accede a relaciones LAZY). */
    public static MensajeChatDTO de(MensajeChat mensaje) {
        String apartamento = Hibernate.unproxy(mensaje.getRemitente()) instanceof Residente r
                ? r.getApartamento().identificadorCompleto() : null;
        return new MensajeChatDTO(
                mensaje.getId(),
                mensaje.getRemitente().getId(),
                mensaje.getRemitente().getNombreCompleto(),
                apartamento,
                mensaje.getDestinatario() != null ? mensaje.getDestinatario().getId() : null,
                mensaje.getContenido(),
                mensaje.getFecha()
        );
    }
}
