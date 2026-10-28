package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.comunicaciones.channel.CanalNotificacion;
import co.edu.uis.resigest.comunicaciones.domain.Notificacion;
import co.edu.uis.resigest.comunicaciones.domain.TipoCanal;
import co.edu.uis.resigest.comunicaciones.domain.TipoNotificacion;
import co.edu.uis.resigest.comunicaciones.dto.NotificacionDTO;
import co.edu.uis.resigest.comunicaciones.repository.NotificacionRepository;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica de notificaciones: crea, lista no leídas y marca leída.
 * La notificación se persiste siempre; los canales agregan entrega adicional.
 */
@Service
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final List<CanalNotificacion> canales;

    public NotificacionServiceImpl(NotificacionRepository notificacionRepository,
                                   List<CanalNotificacion> canales) {
        this.notificacionRepository = notificacionRepository;
        this.canales = canales;
    }

    @Override
    @Transactional
    public void notificar(Usuario destinatario, String titulo, String mensaje,
                          TipoNotificacion tipo, TipoCanal... canalesPedidos) {
        Notificacion notificacion = new Notificacion(destinatario, titulo, mensaje, tipo, null);
        notificacionRepository.save(notificacion);

        for (TipoCanal canal : canalesPedidos) {
            canales.stream()
                    .filter(c -> c.soporta(canal))
                    .forEach(c -> c.enviar(notificacion));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionDTO> listarNoLeidas(Long usuarioId) {
        return notificacionRepository.findByDestinatarioIdAndLeidaFalse(usuarioId).stream()
                .map(NotificacionDTO::de)
                .toList();
    }

    @Override
    @Transactional
    public void marcarLeida(Long id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la notificación con id " + id));
        notificacion.marcarLeida();
    }
}
