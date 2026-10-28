package co.edu.uis.resigest.financiero.repository;

import co.edu.uis.resigest.financiero.domain.FacturaServicioComun;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacturaServicioRepository extends JpaRepository<FacturaServicioComun, Long> {
}
