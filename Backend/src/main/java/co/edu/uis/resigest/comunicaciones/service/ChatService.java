package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.comunicaciones.dto.MensajeComunidadDTO;
import co.edu.uis.resigest.comunicaciones.dto.ConversacionDTO;
import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;

import java.util.List;

public interface ChatService {

    MensajeChatDTO enviar(Long remitenteId, Long destinatarioId, String contenido);

    List<MensajeChatDTO> conversacion(Long usuarioId, Long otroUsuarioId);

    /** Una entrada por cada persona con la que ha hablado, la más reciente primero. */
    List<ConversacionDTO> conversaciones(Long usuarioId);

    /** Últimos mensajes del chat de todo el conjunto, del más antiguo al más reciente. */
    List<MensajeComunidadDTO> mensajesComunidad();

    MensajeComunidadDTO enviarComunidad(Long autorId, String contenido);
}
