package co.edu.uis.resigest.porteria.repository;

import co.edu.uis.resigest.porteria.domain.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaqueteRepository extends JpaRepository<Paquete, Long> {

    List<Paquete> findByApartamentoDestinoId(Long apartamentoId);
}
