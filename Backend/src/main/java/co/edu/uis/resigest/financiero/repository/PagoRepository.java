package co.edu.uis.resigest.financiero.repository;

import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.financiero.domain.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByObligacionId(Long obligacionId);

    List<Pago> findByEstado(EstadoPago estado);
}
