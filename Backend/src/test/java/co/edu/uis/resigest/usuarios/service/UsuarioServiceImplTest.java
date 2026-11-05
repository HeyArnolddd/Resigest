package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.common.exception.ConflictoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.common.security.CacheUsuarios;
import co.edu.uis.resigest.common.security.CifradorContrasenas;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.Portero;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.CredencialesDTO;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;
import co.edu.uis.resigest.usuarios.repository.TokenRecuperacionRepository;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ApartamentoRepository apartamentoRepository;

    @Mock
    private TokenRecuperacionRepository tokenRecuperacionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private final CifradorContrasenas cifrador = new CifradorContrasenas("clave-de-prueba");

    private UsuarioServiceImpl usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioServiceImpl(usuarioRepository, apartamentoRepository,
                tokenRecuperacionRepository, passwordEncoder, cifrador, new CacheUsuarios());
    }

    private static CrearUsuarioRequest solicitud(Rol rol) {
        return new CrearUsuarioRequest("Daniel Rojas", " Portero2@ResiGest.com ", "Clave#123",
                "1098", null, rol, null, null, "mañana", null);
    }

    private Usuario registrarYCapturar(Rol rol) {
        when(passwordEncoder.encode("Clave#123")).thenReturn("hash");
        usuarioService.registrar(solicitud(rol));
        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    void registrarPorteroGuardaCopiaCifradaYCorreoNormalizado() {
        Usuario guardado = registrarYCapturar(Rol.PORTERO);

        assertThat(guardado).isInstanceOf(Portero.class);
        assertThat(guardado.getCorreo()).isEqualTo("portero2@resigest.com");
        assertThat(cifrador.descifrar(guardado.getContrasenaCifrada())).isEqualTo("Clave#123");
    }

    @Test
    void registrarAdministradorNoGuardaCopiaCifrada() {
        Usuario guardado = registrarYCapturar(Rol.ADMINISTRADOR);

        assertThat(guardado.getContrasenaCifrada()).isNull();
    }

    @Test
    void registrarDevuelveLosDatosDelRol() {
        when(passwordEncoder.encode("Clave#123")).thenReturn("hash");

        UsuarioDTO dto = usuarioService.registrar(solicitud(Rol.PORTERO));

        assertThat(dto.rol()).isEqualTo(Rol.PORTERO);
        assertThat(dto.turno()).isEqualTo("mañana");
        assertThat(dto.apartamento()).isNull();
    }

    @Test
    void registrarConCorreoRepetidoLanzaConflicto() {
        when(usuarioRepository.existsByCorreo("portero2@resigest.com")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.registrar(solicitud(Rol.PORTERO)))
                .isInstanceOf(ConflictoException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void credencialesDevuelveLaContrasenaDelPersonal() {
        Portero portero = new Portero("Daniel", "portero@resigest.com", "hash", "1", null, "noche");
        portero.setContrasenaCifrada(cifrador.cifrar("Turno#Noche"));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(portero));

        CredencialesDTO credenciales = usuarioService.credenciales(5L);

        assertThat(credenciales.correo()).isEqualTo("portero@resigest.com");
        assertThat(credenciales.contrasena()).isEqualTo("Turno#Noche");
    }

    @Test
    void credencialesDeUnAdministradorSeRechazan() {
        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(new Administrador("Admin", "admin@resigest.com", "hash", "1", null)));

        assertThatThrownBy(() -> usuarioService.credenciales(1L))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void cambiarContrasenaActualizaHashYCopiaCifrada() {
        Portero portero = new Portero("Daniel", "portero@resigest.com", "viejo", "1", null, "noche");
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(portero));
        when(passwordEncoder.encode("Nueva#456")).thenReturn("nuevo");

        usuarioService.cambiarContrasena(5L, "Nueva#456");

        assertThat(portero.getContrasenaHash()).isEqualTo("nuevo");
        assertThat(cifrador.descifrar(portero.getContrasenaCifrada())).isEqualTo("Nueva#456");
    }

    @Test
    void noSePuedeDesactivarNiEliminarLaPropiaCuenta() {
        assertThatThrownBy(() -> usuarioService.desactivar(1L, 1L)).isInstanceOf(ReglaNegocioException.class);
        assertThatThrownBy(() -> usuarioService.eliminar(1L, 1L)).isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void eliminarUsuarioConHistorialLanzaConflicto() {
        Portero portero = new Portero("Daniel", "portero@resigest.com", "hash", "1", null, "noche");
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(portero));
        doThrow(new DataIntegrityViolationException("fk")).when(usuarioRepository).flush();

        assertThatThrownBy(() -> usuarioService.eliminar(5L, 1L))
                .isInstanceOf(ConflictoException.class)
                .hasMessageContaining("Desactívalo");
    }
}
