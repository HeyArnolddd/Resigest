package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.comunicaciones.dto.CanalComunidadDTO;
import co.edu.uis.resigest.comunicaciones.dto.MensajeComunidadDTO;
import co.edu.uis.resigest.comunicaciones.dto.ConversacionDTO;
import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;

import java.util.List;

public interface ChatService {

    MensajeChatDTO enviar(Long remitenteId, Long destinatarioId, String contenido);

    List<MensajeChatDTO> conversacion(Long usuarioId, Long otroUsuarioId);

    /** Una entrada por cada persona con la que ha hablado, la más reciente primero. */
    List<ConversacionDTO> conversaciones(Long usuarioId);

    /**
     * Chats comunitarios del usuario: el general para todos; el de su torre para el residente;
     * el de todas las torres para la administración.
     */
    List<CanalComunidadDTO> canales(Long usuarioId);

    /** Últimos mensajes de un chat (torreId null = general), del más antiguo al más reciente. */
    List<MensajeComunidadDTO> mensajesComunidad(Long torreId, Long usuarioId);

    MensajeComunidadDTO enviarComunidad(Long autorId, Long torreId, String contenido);
}
