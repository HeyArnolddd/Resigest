package co.edu.uis.resigest.comunicaciones.repository;

import co.edu.uis.resigest.comunicaciones.domain.MensajeComunidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensajeComunidadRepository extends JpaRepository<MensajeComunidad, Long> {

    /** Chat general: los últimos 100 mensajes, del más reciente al más antiguo. */
    List<MensajeComunidad> findTop100ByTorreIsNullOrderByFechaDesc();

    /** Chat de una torre: los últimos 100 mensajes, del más reciente al más antiguo. */
    List<MensajeComunidad> findTop100ByTorreIdOrderByFechaDesc(Long torreId);
}
