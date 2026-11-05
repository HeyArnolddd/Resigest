package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.comunicaciones.domain.Evento;
import co.edu.uis.resigest.comunicaciones.dto.CrearEventoRequest;
import co.edu.uis.resigest.comunicaciones.dto.EventoDTO;
import co.edu.uis.resigest.comunicaciones.repository.EventoRepository;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Agenda del conjunto: la administración publica eventos y todos los ven.
 */
@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;

    public EventoService(EventoRepository eventoRepository, UsuarioRepository usuarioRepository) {
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<EventoDTO> proximos(LocalDate desde) {
        return eventoRepository.findByFechaGreaterThanEqualOrderByFechaAscHoraInicioAsc(desde).stream()
                .map(EventoDTO::de)
                .toList();
    }

    @Transactional
    public EventoDTO crear(CrearEventoRequest request, Long adminId) {
        if (request.horaFin() != null && !request.horaFin().isAfter(request.horaInicio())) {
            throw new ReglaNegocioException("La hora de fin debe ser posterior a la de inicio");
        }
        Usuario admin = usuarioRepository.findById(adminId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + adminId));
        Evento evento = new Evento(request.titulo().trim(), vacioANull(request.descripcion()), request.fecha(),
                request.horaInicio(), request.horaFin(), request.lugar().trim(), request.tipo(), admin);
        return EventoDTO.de(eventoRepository.save(evento));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("No existe el evento con id " + id);
        }
        eventoRepository.deleteById(id);
    }

    private static String vacioANull(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
