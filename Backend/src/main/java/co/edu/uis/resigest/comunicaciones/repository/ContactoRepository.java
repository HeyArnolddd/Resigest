package co.edu.uis.resigest.comunicaciones.repository;

import co.edu.uis.resigest.comunicaciones.domain.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {

    List<Contacto> findAllByOrderByCategoriaAscNombreAsc();
}
