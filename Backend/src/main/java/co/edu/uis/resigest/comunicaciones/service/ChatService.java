package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.comunicaciones.dto.ContactoChatDTO;
import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;

import java.util.List;

public interface ChatService {

    MensajeChatDTO enviar(Long remitenteId, Long destinatarioId, String contenido);

    List<MensajeChatDTO> conversacion(Long usuarioId, Long otroUsuarioId);

    /** Mensajes recientes del chat comunitario, del más antiguo al más nuevo. */
    List<MensajeChatDTO> comunidad();

    MensajeChatDTO enviarComunidad(Long remitenteId, String contenido);

    /** Residentes con los que se puede conversar (todos menos el propio usuario). */
    List<ContactoChatDTO> contactos(Long usuarioId);

    /** Contactos con los que el usuario ya tiene una conversación. */
    List<ContactoChatDTO> conversaciones(Long usuarioId);
}
