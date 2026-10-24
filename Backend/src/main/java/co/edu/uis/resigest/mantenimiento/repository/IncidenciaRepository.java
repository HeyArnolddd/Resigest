package co.edu.uis.resigest.mantenimiento.repository;

import co.edu.uis.resigest.mantenimiento.domain.EstadoIncidencia;
import co.edu.uis.resigest.mantenimiento.domain.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {

    List<Incidencia> findByEstado(EstadoIncidencia estado);

    List<Incidencia> findByReportadoPorId(Long reportadoPorId);

    List<Incidencia> findByAsignadoAId(Long asignadoAId);
}
