package co.edu.uis.resigest.reservas.repository;

import co.edu.uis.resigest.reservas.domain.ZonaComun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ZonaComunRepository extends JpaRepository<ZonaComun, Long> {

    List<ZonaComun> findByActivaTrue();
}
