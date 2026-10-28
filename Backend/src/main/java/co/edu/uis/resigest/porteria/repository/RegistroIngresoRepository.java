package co.edu.uis.resigest.porteria.repository;

import co.edu.uis.resigest.porteria.domain.RegistroIngreso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RegistroIngresoRepository extends JpaRepository<RegistroIngreso, Long> {

    List<RegistroIngreso> findByFechaIngresoBetween(LocalDateTime desde, LocalDateTime hasta);

    List<RegistroIngreso> findByApartamentoDestinoId(Long apartamentoId);
}
