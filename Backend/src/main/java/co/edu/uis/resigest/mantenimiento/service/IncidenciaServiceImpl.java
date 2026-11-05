package co.edu.uis.resigest.mantenimiento.service;

import co.edu.uis.resigest.common.exception.AccesoDenegadoException;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.mantenimiento.domain.EvidenciaIncidencia;
import co.edu.uis.resigest.mantenimiento.domain.Incidencia;
import co.edu.uis.resigest.mantenimiento.dto.AsignarRequest;
import co.edu.uis.resigest.mantenimiento.dto.CrearIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.dto.FiltroIncidencias;
import co.edu.uis.resigest.mantenimiento.dto.IncidenciaDTO;
import co.edu.uis.resigest.mantenimiento.dto.ResolverIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.repository.IncidenciaRepository;
import co.edu.uis.resigest.mantenimiento.storage.AlmacenamientoArchivos;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
                request.prioridad(), reportador, request.categoria());
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
    public Page<IncidenciaDTO> listar(FiltroIncidencias filtro, Long usuarioId, Rol rol, Pageable pageable) {
        Specification<Incidencia> spec = (root, query, cb) -> cb.conjunction();
        if (rol == Rol.RESIDENTE || rol == Rol.PORTERO) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("reportadoPor").get("id"), usuarioId));
        }
        if (filtro.estado() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("estado"), filtro.estado()));
        }
        if (filtro.asignadoAMi()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("asignadoA").get("id"), usuarioId));
        }
        if (filtro.desde() != null) {
            spec = spec.and((root, q, cb) ->
                    cb.greaterThanOrEqualTo(root.get("fechaCreacion"), filtro.desde().atStartOfDay()));
        }
        if (filtro.hasta() != null) {
            spec = spec.and((root, q, cb) ->
                    cb.lessThan(root.get("fechaCreacion"), filtro.hasta().plusDays(1).atStartOfDay()));
        }
        return incidenciaRepository.findAll(spec, pageable).map(IncidenciaDTO::de);
    }

    @Override
    @Transactional
    public IncidenciaDTO iniciar(Long incidenciaId, Long tecnicoId) {
        Incidencia incidencia = buscarIncidencia(incidenciaId);
        if (incidencia.getAsignadoA() == null || !incidencia.getAsignadoA().getId().equals(tecnicoId)) {
            throw new AccesoDenegadoException("La incidencia no está asignada a este técnico");
        }
        incidencia.iniciarTrabajo();
        return IncidenciaDTO.de(incidencia);
    }

    private Incidencia buscarIncidencia(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la incidencia con id " + id));
    }
}
