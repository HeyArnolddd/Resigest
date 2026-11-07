package co.edu.uis.resigest.reservas.dto;

import co.edu.uis.resigest.reservas.domain.ZonaComun;

import java.time.LocalTime;

public record ZonaComunDTO(
        Long id,
        String nombre,
        String descripcion,
        int capacidad,
        boolean activa,
        LocalTime horaApertura,
        LocalTime horaCierre
) {

    public static ZonaComunDTO de(ZonaComun zona) {
        return new ZonaComunDTO(
                zona.getId(), zona.getNombre(), zona.getDescripcion(),
                zona.getCapacidad(), zona.isActiva(), zona.getHoraApertura(), zona.getHoraCierre());
    }
}
