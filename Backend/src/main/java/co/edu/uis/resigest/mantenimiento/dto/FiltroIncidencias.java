package co.edu.uis.resigest.mantenimiento.dto;

import co.edu.uis.resigest.mantenimiento.domain.EstadoIncidencia;

import java.time.LocalDate;

/** Filtros opcionales del listado de incidencias. */
public record FiltroIncidencias(
        EstadoIncidencia estado,
        boolean asignadoAMi,
        LocalDate desde,
        LocalDate hasta
) {
}
