package co.edu.uis.resigest.inmueble.repository;

import co.edu.uis.resigest.inmueble.domain.Apartamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApartamentoRepository extends JpaRepository<Apartamento, Long> {

    /**
     * Busca un apartamento por su número dentro de una torre.
     * El nombre del método se traduce automáticamente a una consulta JPQL.
     */
    Optional<Apartamento> findByTorreIdAndNumero(Long torreId, String numero);
}
