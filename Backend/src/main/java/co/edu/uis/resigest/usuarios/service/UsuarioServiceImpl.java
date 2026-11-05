package co.edu.uis.resigest.usuarios.service;

import java.util.List;
import java.util.Comparator;
import co.edu.uis.resigest.usuarios.dto.DirectorioDTO;
import co.edu.uis.resigest.common.exception.ConflictoException;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.common.security.CacheUsuarios;
import co.edu.uis.resigest.common.security.CifradorContrasenas;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.Portero;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.ActualizarUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.CredencialesDTO;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;
import co.edu.uis.resigest.usuarios.mapper.UsuarioMapper;
import co.edu.uis.resigest.usuarios.repository.TokenRecuperacionRepository;
import co.edu.uis.resigest.usuarios.repository.UsuarioEspecificaciones;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registro y gestión de usuarios. Crea la subclase correcta según el rol.
 * Para portería y mantenimiento guarda además una copia cifrada de la
 * contraseña, que el administrador puede consultar.
 */
@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ApartamentoRepository apartamentoRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CifradorContrasenas cifrador;

    private final CacheUsuarios cacheUsuarios;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository,
                              ApartamentoRepository apartamentoRepository,
                              TokenRecuperacionRepository tokenRecuperacionRepository,
                              PasswordEncoder passwordEncoder,
                              CifradorContrasenas cifrador,
                              CacheUsuarios cacheUsuarios) {
        this.cacheUsuarios = cacheUsuarios;
        this.usuarioRepository = usuarioRepository;
        this.apartamentoRepository = apartamentoRepository;
        this.tokenRecuperacionRepository = tokenRecuperacionRepository;
        this.passwordEncoder = passwordEncoder;
        this.cifrador = cifrador;
    }

    @Override
    @Transactional
    public UsuarioDTO registrar(CrearUsuarioRequest request) {
        String correo = normalizarCorreo(request.correo());
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new ConflictoException("Ya existe un usuario con el correo " + correo);
        }

        Usuario usuario = crearSegunRol(request, correo, passwordEncoder.encode(request.contrasena()));
        if (usuario.getRol().esPersonalOperativo()) {
            usuario.setContrasenaCifrada(cifrador.cifrar(request.contrasena()));
        }
        usuarioRepository.save(usuario);
        return UsuarioMapper.toDto(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO obtener(Long id) {
        return UsuarioMapper.toDto(buscar(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DirectorioDTO> directorio(Long excluirId) {
        return usuarioRepository.findByActivoTrue().stream()
                .filter(u -> !u.getId().equals(excluirId))
                .sorted(Comparator.comparing(Usuario::getNombreCompleto))
                .map(UsuarioMapper::aDirectorio)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioDTO> listar(Rol rol, String texto, Boolean activo, Pageable pageable) {
        return usuarioRepository.findAll(UsuarioEspecificaciones.filtrar(rol, texto, activo), pageable)
                .map(UsuarioMapper::toDto);
    }

    @Override
    @Transactional
    public UsuarioDTO actualizar(Long id, ActualizarUsuarioRequest request) {
        cacheUsuarios.invalidar();
        Usuario usuario = buscar(id);
        String correo = normalizarCorreo(request.correo());
        if (usuarioRepository.existsByCorreoAndIdNot(correo, id)) {
            throw new ConflictoException("Ya existe un usuario con el correo " + correo);
        }

        usuario.setNombreCompleto(request.nombreCompleto().trim());
        usuario.setCorreo(correo);
        usuario.setDocumento(request.documento().trim());
        usuario.setTelefono(vacioANull(request.telefono()));

        // El administrador no tiene datos propios de su rol.
        if (usuario instanceof Residente residente) {
            if (request.tipoResidente() == null || request.apartamentoId() == null) {
                throw new ReglaNegocioException(
                        "El residente requiere tipoResidente y apartamentoId");
            }
            residente.setTipo(request.tipoResidente());
            residente.setApartamento(buscarApartamento(request.apartamentoId()));
        } else if (usuario instanceof Portero portero) {
            portero.setTurno(vacioANull(request.turno()));
        } else if (usuario instanceof TecnicoMantenimiento tecnico) {
            tecnico.setEspecialidad(vacioANull(request.especialidad()));
        }
        return UsuarioMapper.toDto(usuario);
    }

    @Override
    @Transactional
    public void activar(Long id) {
        cacheUsuarios.invalidar();
        buscar(id).activar();
    }

    @Override
    @Transactional
    public void desactivar(Long id, Long solicitanteId) {
        cacheUsuarios.invalidar();
        if (id.equals(solicitanteId)) {
            throw new ReglaNegocioException("No puedes desactivar tu propia cuenta");
        }
        buscar(id).desactivar();
    }

    @Override
    @Transactional
    public void eliminar(Long id, Long solicitanteId) {
        cacheUsuarios.invalidar();
        if (id.equals(solicitanteId)) {
            throw new ReglaNegocioException("No puedes eliminar tu propia cuenta");
        }
        Usuario usuario = buscar(id);
        try {
            tokenRecuperacionRepository.deleteByUsuarioId(id);
            usuarioRepository.delete(usuario);
            usuarioRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictoException(
                    "El usuario tiene registros asociados (pagos, ingresos, incidencias…). "
                            + "Desactívalo en lugar de eliminarlo.");
        }
    }

    @Override
    @Transactional
    public void cambiarContrasena(Long id, String contrasena) {
        cacheUsuarios.invalidar();
        Usuario usuario = buscar(id);
        String cifrada = usuario.getRol().esPersonalOperativo() ? cifrador.cifrar(contrasena) : null;
        usuario.cambiarContrasena(passwordEncoder.encode(contrasena), cifrada);
    }

    @Override
    @Transactional(readOnly = true)
    public CredencialesDTO credenciales(Long id) {
        Usuario usuario = buscar(id);
        if (!usuario.getRol().esPersonalOperativo()) {
            throw new ReglaNegocioException(
                    "Solo se pueden consultar las credenciales del personal de portería y mantenimiento");
        }
        String cifrada = usuario.getContrasenaCifrada();
        return new CredencialesDTO(usuario.getCorreo(), cifrada == null ? null : cifrador.descifrar(cifrada));
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + id));
    }

    private Apartamento buscarApartamento(Long id) {
        return apartamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el apartamento con id " + id));
    }

    private Usuario crearSegunRol(CrearUsuarioRequest request, String correo, String hash) {
        String nombre = request.nombreCompleto().trim();
        String documento = request.documento().trim();
        String telefono = vacioANull(request.telefono());
        return switch (request.rol()) {
            case ADMINISTRADOR -> new Administrador(nombre, correo, hash, documento, telefono);
            case PORTERO -> new Portero(nombre, correo, hash, documento, telefono,
                    vacioANull(request.turno()));
            case MANTENIMIENTO -> new TecnicoMantenimiento(nombre, correo, hash, documento, telefono,
                    vacioANull(request.especialidad()));
            case RESIDENTE -> {
                if (request.tipoResidente() == null || request.apartamentoId() == null) {
                    throw new ReglaNegocioException(
                            "El residente requiere tipoResidente y apartamentoId");
                }
                yield new Residente(nombre, correo, hash, documento, telefono,
                        request.tipoResidente(), buscarApartamento(request.apartamentoId()));
            }
        };
    }

    // El correo es el usuario de acceso: se guarda sin espacios y en minúscula.
    private static String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase();
    }

    private static String vacioANull(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
