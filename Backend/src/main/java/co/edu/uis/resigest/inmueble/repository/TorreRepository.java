package co.edu.uis.resigest.inmueble.repository;

import co.edu.uis.resigest.inmueble.domain.Torre;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a datos de {@link Torre}. Spring Data genera la implementación
 * a partir del nombre de los métodos; aquí basta con los métodos heredados.
 */
public interface TorreRepository extends JpaRepository<Torre, Long> {
}
