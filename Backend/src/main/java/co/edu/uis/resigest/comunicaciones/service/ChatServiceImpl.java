package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.comunicaciones.domain.MensajeChat;
import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;
import co.edu.uis.resigest.comunicaciones.repository.MensajeChatRepository;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica del chat: enviar mensajes y consultar la conversación entre dos usuarios.
 */
@Service
public class ChatServiceImpl implements ChatService {

    private final MensajeChatRepository mensajeChatRepository;
    private final UsuarioRepository usuarioRepository;

    public ChatServiceImpl(MensajeChatRepository mensajeChatRepository,
                           UsuarioRepository usuarioRepository) {
        this.mensajeChatRepository = mensajeChatRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public MensajeChatDTO enviar(Long remitenteId, Long destinatarioId, String contenido) {
        Usuario remitente = usuarioRepository.findById(remitenteId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + remitenteId));
        Usuario destinatario = usuarioRepository.findById(destinatarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + destinatarioId));

        MensajeChat mensaje = new MensajeChat(remitente, destinatario, contenido);
        mensajeChatRepository.save(mensaje);
        return MensajeChatDTO.de(mensaje);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MensajeChatDTO> conversacion(Long usuarioId, Long otroUsuarioId) {
        return mensajeChatRepository.conversacion(usuarioId, otroUsuarioId).stream()
                .map(MensajeChatDTO::de)
                .toList();
    }
}
