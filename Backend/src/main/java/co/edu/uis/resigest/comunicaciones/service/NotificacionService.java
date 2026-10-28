package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.comunicaciones.domain.TipoCanal;
import co.edu.uis.resigest.comunicaciones.domain.TipoNotificacion;
import co.edu.uis.resigest.comunicaciones.dto.NotificacionDTO;
import co.edu.uis.resigest.usuarios.domain.Usuario;

import java.util.List;

public interface NotificacionService {

    void notificar(Usuario destinatario, String titulo, String mensaje,
                   TipoNotificacion tipo, TipoCanal... canales);

    List<NotificacionDTO> listarNoLeidas(Long usuarioId);

    void marcarLeida(Long id);
}
