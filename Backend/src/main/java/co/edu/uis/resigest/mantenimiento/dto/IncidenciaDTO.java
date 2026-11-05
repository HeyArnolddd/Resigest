package co.edu.uis.resigest.mantenimiento.dto;

import java.util.List;
import co.edu.uis.resigest.mantenimiento.domain.EvidenciaIncidencia;
import co.edu.uis.resigest.mantenimiento.domain.Incidencia;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import org.hibernate.Hibernate;

import java.time.LocalDateTime;

public record IncidenciaDTO(
        Long id,
        String titulo,
        String descripcion,
        String ubicacion,
        String categoria,
        String estado,
        String prioridad,
        Long reportadoPorId,
        String reportadoPorNombre,
        String apartamento,
        Long asignadoAId,
        String asignadoANombre,
        String solucion,
        LocalDateTime fechaReporte,
        List<String> evidencias
) {

    public static IncidenciaDTO de(Incidencia incidencia) {
        // reportadoPor es LAZY: se desenvuelve el proxy para saber si es un residente
        Usuario reporta = (Usuario) Hibernate.unproxy(incidencia.getReportadoPor());
        TecnicoMantenimiento tecnico = incidencia.getAsignadoA();
        return new IncidenciaDTO(
                incidencia.getId(),
                incidencia.getTitulo(),
                incidencia.getDescripcion(),
                incidencia.getUbicacion(),
                incidencia.getCategoria(),
                incidencia.getEstado().name(),
                incidencia.getPrioridad().name(),
                reporta.getId(),
                reporta.getNombreCompleto(),
                reporta instanceof Residente r ? r.getApartamento().identificadorCompleto() : null,
                tecnico != null ? tecnico.getId() : null,
                tecnico != null ? tecnico.getNombreCompleto() : null,
                incidencia.getSolucion(),
                incidencia.getFechaCreacion(),
                incidencia.getEvidencias().stream().map(EvidenciaIncidencia::getUrlArchivo).toList()
        );
    }
}
