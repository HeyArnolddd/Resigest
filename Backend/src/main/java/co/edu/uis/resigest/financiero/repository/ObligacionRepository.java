package co.edu.uis.resigest.financiero.repository;

import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ObligacionRepository extends JpaRepository<ObligacionFinanciera, Long> {

    List<ObligacionFinanciera> findByApartamentoId(Long apartamentoId);

    List<ObligacionFinanciera> findByApartamentoIdAndEstado(Long apartamentoId, EstadoObligacion estado);

    List<ObligacionFinanciera> findByEstado(EstadoObligacion estado);

    List<ObligacionFinanciera> findByEstadoAndFechaVencimientoBefore(EstadoObligacion estado, LocalDate fecha);

    boolean existsByApartamentoIdAndConceptoAndPeriodo(Long apartamentoId, ConceptoCobro concepto, String periodo);
}
