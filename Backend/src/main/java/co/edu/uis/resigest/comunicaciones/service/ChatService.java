package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;

import java.util.List;

public interface ChatService {

    MensajeChatDTO enviar(Long remitenteId, Long destinatarioId, String contenido);

    List<MensajeChatDTO> conversacion(Long usuarioId, Long otroUsuarioId);
}
