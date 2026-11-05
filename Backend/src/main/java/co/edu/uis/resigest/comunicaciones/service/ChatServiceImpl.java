package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.comunicaciones.domain.MensajeChat;
import co.edu.uis.resigest.comunicaciones.dto.ContactoChatDTO;
import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.usuarios.domain.Residente;
import org.hibernate.Hibernate;
import org.springframework.data.domain.PageRequest;
import java.util.ArrayList;
import java.util.Collections;
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

    private static final int MENSAJES_COMUNIDAD = 100;

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
        if (destinatarioId == null) {
            throw new ReglaNegocioException("Indica el destinatario del mensaje");
        }
        Usuario destinatario = usuarioRepository.findById(destinatarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + destinatarioId));

        MensajeChat mensaje = new MensajeChat(remitente, destinatario, contenido);
        mensajeChatRepository.save(mensaje);
        return MensajeChatDTO.de(mensaje);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MensajeChatDTO> comunidad() {
        List<MensajeChat> recientes = new ArrayList<>(
                mensajeChatRepository.comunidad(PageRequest.of(0, MENSAJES_COMUNIDAD)));
        Collections.reverse(recientes);
        return recientes.stream().map(MensajeChatDTO::de).toList();
    }

    @Override
    @Transactional
    public MensajeChatDTO enviarComunidad(Long remitenteId, String contenido) {
        Usuario remitente = usuarioRepository.findById(remitenteId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + remitenteId));
        MensajeChat mensaje = new MensajeChat(remitente, null, contenido);
        mensajeChatRepository.save(mensaje);
        return MensajeChatDTO.de(mensaje);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactoChatDTO> contactos(Long usuarioId) {
        return usuarioRepository.findByActivoTrue().stream()
                .filter(u -> !u.getId().equals(usuarioId))
                .filter(u -> Hibernate.unproxy(u) instanceof Residente)
                .map(this::aContacto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactoChatDTO> conversaciones(Long usuarioId) {
        return mensajeChatRepository.interlocutores(usuarioId).stream()
                .map(id -> usuarioRepository.findById(id).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(this::aContacto)
                .toList();
    }

    private ContactoChatDTO aContacto(Usuario u) {
        String apartamento = Hibernate.unproxy(u) instanceof Residente r
                ? r.getApartamento().identificadorCompleto() : null;
        return new ContactoChatDTO(u.getId(), u.getNombreCompleto(), apartamento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MensajeChatDTO> conversacion(Long usuarioId, Long otroUsuarioId) {
        return mensajeChatRepository.conversacion(usuarioId, otroUsuarioId).stream()
                .map(MensajeChatDTO::de)
                .toList();
    }
}
