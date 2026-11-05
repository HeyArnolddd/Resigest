package co.edu.uis.resigest.reservas.repository;

import co.edu.uis.resigest.reservas.domain.EstadoReserva;
import co.edu.uis.resigest.reservas.domain.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByZonaComunId(Long zonaComunId);

    /** Filtros opcionales: con ambos en null devuelve todas las reservas. */
    @Query("""
            select r from Reserva r
            where (:zonaId is null or r.zonaComun.id = :zonaId)
              and (:apartamentoId is null or r.apartamento.id = :apartamentoId)
              and (:estado is null or r.estado = :estado)
            order by r.fechaInicio
            """)
    List<Reserva> filtrar(@Param("zonaId") Long zonaId, @Param("apartamentoId") Long apartamentoId,
                          @Param("estado") EstadoReserva estado);

    /** Reservas activas (pendientes o aprobadas) que se cruzan con el rango dado. */
    @Query("""
            select r from Reserva r
            where r.zonaComun.id = :zonaId
              and r.estado in :estados
              and r.fechaInicio < :fin
              and :inicio < r.fechaFin
            """)
    List<Reserva> findSolapadas(@Param("zonaId") Long zonaId,
                                @Param("estados") List<EstadoReserva> estados,
                                @Param("inicio") LocalDateTime inicio,
                                @Param("fin") LocalDateTime fin);
}
