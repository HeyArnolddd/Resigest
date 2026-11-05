package co.edu.uis.resigest.financiero.repository;

import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ObligacionRepository extends JpaRepository<ObligacionFinanciera, Long> {

    List<ObligacionFinanciera> findByApartamentoId(Long apartamentoId);

    List<ObligacionFinanciera> findByApartamentoIdAndEstado(Long apartamentoId, EstadoObligacion estado);

    List<ObligacionFinanciera> findByEstado(EstadoObligacion estado);

    List<ObligacionFinanciera> findByEstadoAndFechaVencimientoBefore(EstadoObligacion estado, LocalDate fecha);

    /** [periodo, facturado, recaudado] por periodo. */
    @Query("select o.periodo, sum(o.montoTotal), sum(o.montoTotal - o.saldoPendiente) from ObligacionFinanciera o group by o.periodo")
    List<Object[]> totalesPorPeriodo();

    @Query("select count(distinct o.apartamento.id) from ObligacionFinanciera o where o.estado = :estado")
    long contarApartamentosConEstado(@Param("estado") EstadoObligacion estado);

    @Query("select coalesce(sum(o.saldoPendiente), 0) from ObligacionFinanciera o where o.estado = :estado")
    java.math.BigDecimal saldoPorEstado(@Param("estado") EstadoObligacion estado);

    boolean existsByApartamentoIdAndEstado(Long apartamentoId, EstadoObligacion estado);

    boolean existsByApartamentoIdAndConceptoAndPeriodo(Long apartamentoId, ConceptoCobro concepto, String periodo);
}
