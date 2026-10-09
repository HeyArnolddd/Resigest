package co.edu.uis.resigest.usuarios.repository;

import co.edu.uis.resigest.usuarios.domain.Residente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResidenteRepository extends JpaRepository<Residente, Long> {

    List<Residente> findByApartamentoId(Long apartamentoId);

    Optional<Residente> findByCorreo(String correo);
}
