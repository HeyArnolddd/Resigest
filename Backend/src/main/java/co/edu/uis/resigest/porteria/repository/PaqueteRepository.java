package co.edu.uis.resigest.porteria.repository;

import co.edu.uis.resigest.porteria.domain.Paquete;
import co.edu.uis.resigest.porteria.domain.EstadoPaquete;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaqueteRepository extends JpaRepository<Paquete, Long> {

    List<Paquete> findByApartamentoDestinoId(Long apartamentoId);

    List<Paquete> findByEstadoOrderByFechaRecepcionDesc(EstadoPaquete estado);

    List<Paquete> findByApartamentoDestinoIdAndEstado(Long apartamentoId, EstadoPaquete estado);
}
