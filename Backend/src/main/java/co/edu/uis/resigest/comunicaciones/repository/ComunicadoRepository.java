package co.edu.uis.resigest.comunicaciones.repository;

import co.edu.uis.resigest.comunicaciones.domain.Comunicado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {

    List<Comunicado> findByFijadoTrue();
}
