package co.edu.uis.resigest.mantenimiento.service;

import co.edu.uis.resigest.mantenimiento.event.IncidenciaActualizadaEvento;
import org.springframework.context.ApplicationEventPublisher;
import java.util.List;
import co.edu.uis.resigest.common.exception.AccesoDenegadoException;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.mantenimiento.domain.EvidenciaIncidencia;
import co.edu.uis.resigest.mantenimiento.domain.Incidencia;
import co.edu.uis.resigest.mantenimiento.dto.AsignarRequest;
import co.edu.uis.resigest.mantenimiento.dto.CrearIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.dto.IncidenciaDTO;
import co.edu.uis.resigest.mantenimiento.dto.ResolverIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.repository.IncidenciaRepository;
import co.edu.uis.resigest.mantenimiento.storage.AlmacenamientoArchivos;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Lógica de incidencias: reportar, adjuntar evidencia, asignar y resolver.
 */
@Service
public class IncidenciaServiceImpl implements IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlmacenamientoArchivos almacenamientoArchivos;

    private final ApplicationEventPublisher eventPublisher;

    public IncidenciaServiceImpl(IncidenciaRepository incidenciaRepository,
                                 UsuarioRepository usuarioRepository,
                                 AlmacenamientoArchivos almacenamientoArchivos,
                                 ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.almacenamientoArchivos = almacenamientoArchivos;
    }

    @Override
    @Transactional
    public IncidenciaDTO reportar(CrearIncidenciaRequest request, Long usuarioId) {
        Usuario reportador = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + usuarioId));

        Incidencia incidencia = new Incidencia(
                request.titulo(), request.descripcion(), request.ubicacion(),
                request.prioridad(), reportador);
        incidencia.setCategoria(request.categoria());
        incidenciaRepository.save(incidencia);
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional
    public IncidenciaDTO agregarEvidencia(Long incidenciaId, MultipartFile archivo, Long usuarioId) {
        Incidencia incidencia = buscarIncidencia(incidenciaId);
        if (!incidencia.getReportadoPor().getId().equals(usuarioId)) {
            throw new AccesoDenegadoException("Solo quien reportó la incidencia puede adjuntar evidencias");
        }
        String url = almacenamientoArchivos.guardar(archivo);
        incidencia.getEvidencias().add(new EvidenciaIncidencia(
                incidencia, url, archivo.getOriginalFilename()));
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional
    public IncidenciaDTO asignar(Long incidenciaId, AsignarRequest request) {
        Incidencia incidencia = buscarIncidencia(incidenciaId);
        Usuario usuario = usuarioRepository.findById(request.tecnicoId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + request.tecnicoId()));
        if (!(usuario instanceof TecnicoMantenimiento tecnico)) {
            throw new ReglaNegocioException("El usuario asignado no es un técnico de mantenimiento");
        }
        incidencia.asignarA(tecnico);
        eventPublisher.publishEvent(new IncidenciaActualizadaEvento(
                IncidenciaActualizadaEvento.Tipo.ASIGNADA, tecnico.getId(), incidencia.getTitulo()));
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional
    public IncidenciaDTO resolver(Long incidenciaId, ResolverIncidenciaRequest request, Long tecnicoId) {
        Incidencia incidencia = buscarIncidencia(incidenciaId);
        verificarAsignada(incidencia, tecnicoId);
        incidencia.resolver(request.solucion());
        eventPublisher.publishEvent(new IncidenciaActualizadaEvento(
                IncidenciaActualizadaEvento.Tipo.RESUELTA, incidencia.getReportadoPor().getId(), incidencia.getTitulo()));
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional
    public IncidenciaDTO iniciar(Long incidenciaId, Long tecnicoId) {
        Incidencia incidencia = buscarIncidencia(incidenciaId);
        verificarAsignada(incidencia, tecnicoId);
        incidencia.iniciarTrabajo();
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenciaDTO> listarReportadasPor(Long usuarioId) {
        return incidenciaRepository.findByReportadoPorIdOrderByFechaCreacionDesc(usuarioId).stream()
                .map(IncidenciaDTO::de)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenciaDTO> listarAsignadasA(Long tecnicoId) {
        return incidenciaRepository.findByAsignadoAIdOrderByFechaCreacionDesc(tecnicoId).stream()
                .map(IncidenciaDTO::de)
                .toList();
    }

    private void verificarAsignada(Incidencia incidencia, Long tecnicoId) {
        if (incidencia.getAsignadoA() == null || !incidencia.getAsignadoA().getId().equals(tecnicoId)) {
            throw new AccesoDenegadoException("Esta incidencia no está asignada a ti");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IncidenciaDTO> listar(Pageable pageable) {
        return incidenciaRepository.findAll(pageable).map(IncidenciaDTO::de);
    }

    private Incidencia buscarIncidencia(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la incidencia con id " + id));
    }
}
