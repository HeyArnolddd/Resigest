package co.edu.uis.resigest.comunicaciones.service;

import java.util.Collections;
import java.util.ArrayList;
import co.edu.uis.resigest.comunicaciones.repository.MensajeComunidadRepository;
import co.edu.uis.resigest.comunicaciones.dto.MensajeComunidadDTO;
import co.edu.uis.resigest.comunicaciones.domain.MensajeComunidad;
import java.util.Map;
import java.util.LinkedHashMap;
import co.edu.uis.resigest.usuarios.mapper.UsuarioMapper;
import co.edu.uis.resigest.usuarios.dto.DirectorioDTO;
import co.edu.uis.resigest.comunicaciones.dto.ConversacionDTO;
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

    private final MensajeComunidadRepository mensajeComunidadRepository;

    public ChatServiceImpl(MensajeChatRepository mensajeChatRepository,
                           UsuarioRepository usuarioRepository,
                           MensajeComunidadRepository mensajeComunidadRepository) {
        this.mensajeComunidadRepository = mensajeComunidadRepository;
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

    @Override
    @Transactional(readOnly = true)
    public List<ConversacionDTO> conversaciones(Long usuarioId) {
        Map<Long, ConversacionDTO> porPersona = new LinkedHashMap<>();
        for (MensajeChat m : mensajeChatRepository.deUsuario(usuarioId)) {
            boolean mio = m.getRemitente().getId().equals(usuarioId);
            Usuario otro = mio ? m.getDestinatario() : m.getRemitente();
            porPersona.computeIfAbsent(otro.getId(), id -> {
                DirectorioDTO contacto = UsuarioMapper.aDirectorio(otro);
                return new ConversacionDTO(id, contacto.nombreCompleto(), contacto.detalle(),
                        m.getContenido(), m.getFecha(), mio);
            });
        }
        return List.copyOf(porPersona.values());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MensajeComunidadDTO> mensajesComunidad() {
        List<MensajeComunidadDTO> recientes = new ArrayList<>(mensajeComunidadRepository.findTop100ByOrderByFechaDesc()
                .stream().map(MensajeComunidadDTO::de).toList());
        Collections.reverse(recientes);
        return recientes;
    }

    @Override
    @Transactional
    public MensajeComunidadDTO enviarComunidad(Long autorId, String contenido) {
        Usuario autor = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + autorId));
        return MensajeComunidadDTO.de(mensajeComunidadRepository.save(new MensajeComunidad(autor, contenido.trim())));
    }
}
