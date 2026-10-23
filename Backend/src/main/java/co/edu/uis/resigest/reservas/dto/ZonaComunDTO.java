package co.edu.uis.resigest.reservas.dto;

import co.edu.uis.resigest.reservas.domain.ZonaComun;

public record ZonaComunDTO(
        Long id,
        String nombre,
        String descripcion,
        int capacidad,
        boolean activa
) {

    public static ZonaComunDTO de(ZonaComun zona) {
        return new ZonaComunDTO(
                zona.getId(), zona.getNombre(), zona.getDescripcion(),
                zona.getCapacidad(), zona.isActiva());
    }
}
