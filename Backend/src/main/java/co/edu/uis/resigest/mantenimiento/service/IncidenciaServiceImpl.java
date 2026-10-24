package co.edu.uis.resigest.mantenimiento.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Lógica de incidencias: reportar, adjuntar evidencia, asignar y resolver.
 */
@Service
public class IncidenciaServiceImpl implements IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlmacenamientoArchivos almacenamientoArchivos;

    public IncidenciaServiceImpl(IncidenciaRepository incidenciaRepository,
                                 UsuarioRepository usuarioRepository,
                                 AlmacenamientoArchivos almacenamientoArchivos) {
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
        incidenciaRepository.save(incidencia);
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional
    public IncidenciaDTO agregarEvidencia(Long incidenciaId, MultipartFile archivo) {
        Incidencia incidencia = buscarIncidencia(incidenciaId);
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
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional
    public IncidenciaDTO resolver(Long incidenciaId, ResolverIncidenciaRequest request) {
        Incidencia incidencia = buscarIncidencia(incidenciaId);
        incidencia.resolver(request.solucion());
        return IncidenciaDTO.de(incidencia);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidenciaDTO> listar() {
        return incidenciaRepository.findAll().stream()
                .map(IncidenciaDTO::de)
                .toList();
    }

    private Incidencia buscarIncidencia(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la incidencia con id " + id));
    }
}
