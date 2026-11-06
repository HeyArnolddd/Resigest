package co.edu.uis.resigest.financiero.repository;

import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.financiero.domain.Pago;
import co.edu.uis.resigest.financiero.domain.PagoPasarela;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByObligacionId(Long obligacionId);

    List<Pago> findByEstado(EstadoPago estado);

    List<Pago> findByObligacionApartamentoIdOrderByFechaDesc(Long apartamentoId);

    /** Bloquea la fila para que el regreso del residente y el aviso de PayU no apliquen el mismo pago dos veces. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PagoPasarela p WHERE p.referencia = :referencia")
    Optional<PagoPasarela> findPasarelaParaActualizar(@Param("referencia") String referencia);
}
