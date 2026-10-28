package co.edu.uis.resigest.inmueble.repository;

import co.edu.uis.resigest.inmueble.domain.Torre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Acceso a datos de {@link Torre}. Spring Data genera la implementación
 * a partir del nombre de los métodos.
 */
public interface TorreRepository extends JpaRepository<Torre, Long> {

    /**
     * Busca una torre por su nombre (se usa para evitar nombres duplicados).
     */
    Optional<Torre> findByNombre(String nombre);
}
