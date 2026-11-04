package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.common.exception.AutenticacionException;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.common.security.JwtService;
import co.edu.uis.resigest.usuarios.domain.TokenRecuperacion;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.LoginRequest;
import co.edu.uis.resigest.usuarios.dto.TokenResponse;
import co.edu.uis.resigest.usuarios.repository.TokenRecuperacionRepository;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lógica de autenticación: valida credenciales, maneja el bloqueo por intentos
 * fallidos (RF01), emite el token JWT y gestiona la recuperación de contraseña.
 *
 * Nota: autenticar() NO lleva @Transactional a propósito. Si se lanzara una
 * excepción dentro de una transacción, el contador de intentos fallidos se
 * revertiría y nunca se persistiría. Sin transacción, cada save() se confirma
 * de inmediato, así el intento fallido queda registrado aunque falle el login.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;

    public AuthServiceImpl(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           TokenRecuperacionRepository tokenRecuperacionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRecuperacionRepository = tokenRecuperacionRepository;
    }

    @Override
    public TokenResponse autenticar(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.correo())
                .orElseThrow(() -> new AutenticacionException("Credenciales inválidas"));

        if (usuario.estaBloqueado()) {
            throw new AutenticacionException("Cuenta bloqueada. Intente más tarde.");
        }
        if (!usuario.isActivo()) {
            throw new AutenticacionException("Cuenta inactiva.");
        }

        if (!passwordEncoder.matches(request.contrasena(), usuario.getContrasenaHash())) {
            usuario.registrarIntentoFallido();
            usuarioRepository.save(usuario);
            throw new AutenticacionException("Credenciales inválidas");
        }

        usuario.reiniciarIntentos();
        usuarioRepository.save(usuario);

        String token = jwtService.generarToken(usuario);
        return new TokenResponse(token, usuario.getRol().name(), usuario.getCorreo());
    }

    @Override
    @Transactional
    public void solicitarRecuperacion(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un usuario con ese correo"));

        String token = UUID.randomUUID().toString();
        tokenRecuperacionRepository.save(
                new TokenRecuperacion(token, usuario, LocalDateTime.now().plusHours(1)));

        // En producción: enviar el enlace por correo. Aquí se registra en el log.
        log.info("Enlace de recuperación (simulado por correo): token={}", token);
    }

    @Override
    @Transactional
    public void restablecerContrasena(String token, String nuevaContrasena) {
        TokenRecuperacion recuperacion = tokenRecuperacionRepository.findByToken(token)
                .orElseThrow(() -> new ReglaNegocioException("Token inválido"));
        if (!recuperacion.esValido()) {
            throw new ReglaNegocioException("Token vencido o ya utilizado");
        }

        Usuario usuario = recuperacion.getUsuario();
        usuario.setContrasenaHash(passwordEncoder.encode(nuevaContrasena));
        usuario.reiniciarIntentos();
        recuperacion.marcarUsado();
    }
}
