package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.common.exception.ConflictoException;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.Portero;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;
import co.edu.uis.resigest.usuarios.mapper.UsuarioMapper;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.Portero;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registro y gestión de usuarios. Crea la subclase correcta según el rol.
 */
@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ObligacionRepository obligacionRepository;
    private final ApartamentoRepository apartamentoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository,
                              ApartamentoRepository apartamentoRepository,
                              PasswordEncoder passwordEncoder,
                              ObligacionRepository obligacionRepository) {
        this.obligacionRepository = obligacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.apartamentoRepository = apartamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UsuarioDTO registrar(CrearUsuarioRequest request) {
        if (usuarioRepository.existsByCorreo(request.correo())) {
            throw new ConflictoException("Ya existe un usuario con el correo " + request.correo());
        }

        String hash = passwordEncoder.encode(request.contrasena());
        Usuario usuario = crearSegunRol(request, hash);
        usuarioRepository.save(usuario);
        return UsuarioMapper.toDto(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO obtener(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + id));
        return UsuarioMapper.toDto(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioDTO> listar(Rol rol, Pageable pageable) {
        Specification<Usuario> spec = (root, q, cb) -> cb.conjunction();
        if (rol != null) {
            Class<? extends Usuario> tipo = switch (rol) {
                case RESIDENTE -> Residente.class;
                case ADMINISTRADOR -> Administrador.class;
                case PORTERO -> Portero.class;
                case MANTENIMIENTO -> TecnicoMantenimiento.class;
            };
            spec = spec.and((root, q, cb) -> cb.equal(root.type(), tipo));
        }
        return usuarioRepository.findAll(spec, pageable).map(
                u -> UsuarioMapper.toDto(u, apartamentoId -> obligacionRepository
                        .existsByApartamentoIdAndEstado(apartamentoId, EstadoObligacion.VENCIDA)));
    }

    @Override
    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + id));
        usuario.desactivar();
    }

    private Usuario crearSegunRol(CrearUsuarioRequest request, String hash) {
        return switch (request.rol()) {
            case ADMINISTRADOR -> new Administrador(
                    request.nombreCompleto(), request.correo(), hash,
                    request.documento(), request.telefono());
            case PORTERO -> new Portero(
                    request.nombreCompleto(), request.correo(), hash,
                    request.documento(), request.telefono(), request.turno());
            case MANTENIMIENTO -> new TecnicoMantenimiento(
                    request.nombreCompleto(), request.correo(), hash,
                    request.documento(), request.telefono(), request.especialidad());
            case RESIDENTE -> crearResidente(request, hash);
        };
    }

    private Residente crearResidente(CrearUsuarioRequest request, String hash) {
        if (request.tipoResidente() == null || request.apartamentoId() == null) {
            throw new ReglaNegocioException(
                    "El residente requiere tipoResidente y apartamentoId");
        }
        Apartamento apartamento = apartamentoRepository.findById(request.apartamentoId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el apartamento con id " + request.apartamentoId()));
        return new Residente(
                request.nombreCompleto(), request.correo(), hash,
                request.documento(), request.telefono(),
                request.tipoResidente(), apartamento);
    }
}
