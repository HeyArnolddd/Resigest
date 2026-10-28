package co.edu.uis.resigest.financiero.repository;

import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.financiero.domain.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByObligacionId(Long obligacionId);

    List<Pago> findByEstado(EstadoPago estado);

    @Query(value = "SELECT * FROM pago WHERE id_transaccion_externa = :idTransaccion", nativeQuery = true)
    Optional<Pago> findByIdTransaccionExterna(@Param("idTransaccion") String idTransaccion);
}
