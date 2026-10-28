package co.edu.uis.resigest.reservas.dto;

import co.edu.uis.resigest.reservas.domain.Reserva;

import java.time.LocalDateTime;

public record ReservaDTO(
        Long id,
        Long zonaComunId,
        String zonaComunNombre,
        Long apartamentoId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String estado
) {

    public static ReservaDTO de(Reserva reserva) {
        return new ReservaDTO(
                reserva.getId(),
                reserva.getZonaComun().getId(),
                reserva.getZonaComun().getNombre(),
                reserva.getApartamento().getId(),
                reserva.getFechaInicio(),
                reserva.getFechaFin(),
                reserva.getEstado().name()
        );
    }
}
