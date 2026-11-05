package co.edu.uis.resigest.comunicaciones.repository;

import co.edu.uis.resigest.comunicaciones.domain.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    List<Evento> findByFechaBetweenOrderByFechaAsc(LocalDateTime desde, LocalDateTime hasta);
}
