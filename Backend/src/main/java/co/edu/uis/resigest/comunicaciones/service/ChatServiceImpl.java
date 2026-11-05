package co.edu.uis.resigest.comunicaciones.service;

import java.util.Comparator;
import org.hibernate.Hibernate;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.inmueble.repository.TorreRepository;
import co.edu.uis.resigest.inmueble.domain.Torre;
import co.edu.uis.resigest.common.exception.AccesoDenegadoException;
import co.edu.uis.resigest.comunicaciones.dto.CanalComunidadDTO;
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
    private final TorreRepository torreRepository;

    public ChatServiceImpl(MensajeChatRepository mensajeChatRepository,
                           UsuarioRepository usuarioRepository,
                           MensajeComunidadRepository mensajeComunidadRepository,
                           TorreRepository torreRepository) {
        this.torreRepository = torreRepository;
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
    public List<CanalComunidadDTO> canales(Long usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        List<CanalComunidadDTO> canales = new ArrayList<>();
        canales.add(new CanalComunidadDTO(null, "Chat del conjunto"));
        if (usuario.getRol() == Rol.ADMINISTRADOR) {
            torreRepository.findAll().stream()
                    .sorted(Comparator.comparing(Torre::getNombre))
                    .forEach(t -> canales.add(new CanalComunidadDTO(t.getId(), "Chat de la Torre " + t.getNombre())));
        } else if (usuario instanceof Residente residente) {
            Torre torre = residente.getApartamento().getTorre();
            canales.add(new CanalComunidadDTO(torre.getId(), "Chat de la Torre " + torre.getNombre()));
        }
        return canales;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MensajeComunidadDTO> mensajesComunidad(Long torreId, Long usuarioId) {
        verificarAccesoCanal(torreId, buscarUsuario(usuarioId));
        List<MensajeComunidad> ultimos = torreId == null
                ? mensajeComunidadRepository.findTop100ByTorreIsNullOrderByFechaDesc()
                : mensajeComunidadRepository.findTop100ByTorreIdOrderByFechaDesc(torreId);
        List<MensajeComunidadDTO> recientes = new ArrayList<>(ultimos.stream().map(MensajeComunidadDTO::de).toList());
        Collections.reverse(recientes);
        return recientes;
    }

    @Override
    @Transactional
    public MensajeComunidadDTO enviarComunidad(Long autorId, Long torreId, String contenido) {
        Usuario autor = buscarUsuario(autorId);
        verificarAccesoCanal(torreId, autor);
        Torre torre = torreId == null ? null : torreRepository.findById(torreId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la torre con id " + torreId));
        return MensajeComunidadDTO.de(mensajeComunidadRepository.save(new MensajeComunidad(autor, torre, contenido.trim())));
    }

    // El chat general es para todos; el de una torre, solo para sus residentes y la administración
    private void verificarAccesoCanal(Long torreId, Usuario usuario) {
        if (torreId == null || usuario.getRol() == Rol.ADMINISTRADOR) {
            return;
        }
        if (usuario instanceof Residente residente
                && residente.getApartamento().getTorre().getId().equals(torreId)) {
            return;
        }
        throw new AccesoDenegadoException("Solo los residentes de esa torre pueden ver su chat");
    }

    private Usuario buscarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + id));
        return (Usuario) Hibernate.unproxy(usuario);
    }
}
