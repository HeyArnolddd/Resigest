package co.edu.uis.resigest.mantenimiento.dto;

import co.edu.uis.resigest.mantenimiento.domain.Incidencia;

public record IncidenciaDTO(
        Long id,
        String titulo,
        String descripcion,
        String ubicacion,
        String estado,
        String prioridad,
        Long reportadoPorId,
        Long asignadoAId,
        String solucion
) {

    public static IncidenciaDTO de(Incidencia incidencia) {
        return new IncidenciaDTO(
                incidencia.getId(),
                incidencia.getTitulo(),
                incidencia.getDescripcion(),
                incidencia.getUbicacion(),
                incidencia.getEstado().name(),
                incidencia.getPrioridad().name(),
                incidencia.getReportadoPor().getId(),
                incidencia.getAsignadoA() != null ? incidencia.getAsignadoA().getId() : null,
                incidencia.getSolucion()
        );
    }
}
