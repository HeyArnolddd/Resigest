package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.common.exception.AutenticacionException;
import co.edu.uis.resigest.common.security.JwtService;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.LoginRequest;
import co.edu.uis.resigest.usuarios.dto.TokenResponse;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void autenticarDevuelveTokenConCredencialesCorrectas() {
        Usuario usuario = new Administrador("Admin", "admin@resigest.com", "hash", "doc", null);
        LoginRequest request = new LoginRequest("admin@resigest.com", "admin123");

        when(usuarioRepository.findByCorreo("admin@resigest.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("admin123", "hash")).thenReturn(true);
        when(jwtService.generarToken(usuario)).thenReturn("token-fake");

        TokenResponse response = authService.autenticar(request);

        assertThat(response.token()).isEqualTo("token-fake");
        assertThat(response.rol()).isEqualTo("ADMINISTRADOR");
    }

    @Test
    void autenticarRegistraIntentoFallidoConCredencialesIncorrectas() {
        Usuario usuario = new Administrador("Admin", "admin@resigest.com", "hash", "doc", null);
        LoginRequest request = new LoginRequest("admin@resigest.com", "mala");

        when(usuarioRepository.findByCorreo("admin@resigest.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.autenticar(request))
                .isInstanceOf(AutenticacionException.class);
        verify(usuarioRepository).save(usuario);
    }
}
