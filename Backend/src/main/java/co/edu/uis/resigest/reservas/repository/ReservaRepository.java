package co.edu.uis.resigest.reservas.repository;

import co.edu.uis.resigest.reservas.domain.EstadoReserva;
import co.edu.uis.resigest.reservas.domain.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long>, JpaSpecificationExecutor<Reserva> {

    long countByEstado(EstadoReserva estado);

    /** [zonaId, nombre, reservas] de las reservas en el estado y rango dados. */
    @Query("""
            select r.zonaComun.id, r.zonaComun.nombre, count(r) from Reserva r
            where r.estado = :estado and r.fechaInicio >= :desde and r.fechaInicio < :hasta
            group by r.zonaComun.id, r.zonaComun.nombre
            """)
    List<Object[]> usoPorZona(@Param("estado") EstadoReserva estado,
                              @Param("desde") LocalDateTime desde,
                              @Param("hasta") LocalDateTime hasta);

    List<Reserva> findByZonaComunId(Long zonaComunId);

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
