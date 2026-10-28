package co.edu.uis.resigest.comunicaciones.repository;

import co.edu.uis.resigest.comunicaciones.domain.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByDestinatarioIdAndLeidaFalse(Long destinatarioId);

    List<Notificacion> findByDestinatarioId(Long destinatarioId);
}
