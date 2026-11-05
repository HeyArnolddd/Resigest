package co.edu.uis.resigest.reservas.dto;

import co.edu.uis.resigest.reservas.domain.Reserva;

import java.time.LocalDateTime;

public record ReservaDTO(
        Long id,
        Long zonaComunId,
        String zonaComunNombre,
        Long apartamentoId,
        String apartamento,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String estado,
        String justificacionRechazo
) {

    public static ReservaDTO de(Reserva reserva) {
        return new ReservaDTO(
                reserva.getId(),
                reserva.getZonaComun().getId(),
                reserva.getZonaComun().getNombre(),
                reserva.getApartamento().getId(),
                reserva.getApartamento().identificadorCompleto(),
                reserva.getFechaInicio(),
                reserva.getFechaFin(),
                reserva.getEstado().name(),
                reserva.getJustificacionRechazo()
        );
    }
}
