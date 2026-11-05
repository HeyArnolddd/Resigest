package co.edu.uis.resigest.mantenimiento.dto;

import co.edu.uis.resigest.mantenimiento.domain.EvidenciaIncidencia;
import co.edu.uis.resigest.mantenimiento.domain.Incidencia;
import co.edu.uis.resigest.usuarios.domain.Residente;

import org.hibernate.Hibernate;

import java.time.LocalDateTime;
import java.util.List;

/** Debe construirse dentro de una transacción (accede a relaciones LAZY). */
public record IncidenciaDTO(
        Long id,
        String titulo,
        String descripcion,
        String ubicacion,
        String categoria,
        String estado,
        String prioridad,
        LocalDateTime fechaReporte,
        Long reportadoPorId,
        String reportadoPorNombre,
        String apartamento,
        Long asignadoAId,
        String asignadoANombre,
        String solucion,
        List<String> evidencias
) {

    public static IncidenciaDTO de(Incidencia incidencia) {
        // El reportante llega como proxy LAZY de Usuario: hay que desenvolverlo para saber si es residente.
        String apartamento = Hibernate.unproxy(incidencia.getReportadoPor()) instanceof Residente r
                ? r.getApartamento().identificadorCompleto() : null;
        return new IncidenciaDTO(
                incidencia.getId(),
                incidencia.getTitulo(),
                incidencia.getDescripcion(),
                incidencia.getUbicacion(),
                incidencia.getCategoria(),
                incidencia.getEstado().name(),
                incidencia.getPrioridad().name(),
                incidencia.getFechaCreacion(),
                incidencia.getReportadoPor().getId(),
                incidencia.getReportadoPor().getNombreCompleto(),
                apartamento,
                incidencia.getAsignadoA() != null ? incidencia.getAsignadoA().getId() : null,
                incidencia.getAsignadoA() != null ? incidencia.getAsignadoA().getNombreCompleto() : null,
                incidencia.getSolucion(),
                incidencia.getEvidencias().stream().map(EvidenciaIncidencia::getUrlArchivo).toList()
        );
    }
}
