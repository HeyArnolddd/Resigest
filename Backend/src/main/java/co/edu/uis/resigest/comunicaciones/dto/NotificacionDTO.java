package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.Notificacion;

import java.time.LocalDateTime;

public record NotificacionDTO(
        Long id,
        String titulo,
        String mensaje,
        String tipo,
        boolean leida,
        LocalDateTime fechaEnvio
) {

    public static NotificacionDTO de(Notificacion notificacion) {
        return new NotificacionDTO(
                notificacion.getId(),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getTipo().name(),
                notificacion.isLeida(),
                notificacion.getFechaEnvio()
        );
    }
}
