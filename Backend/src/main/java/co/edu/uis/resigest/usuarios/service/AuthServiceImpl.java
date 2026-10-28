package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.common.exception.AutenticacionException;
import co.edu.uis.resigest.common.security.JwtService;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.LoginRequest;
import co.edu.uis.resigest.usuarios.dto.TokenResponse;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Lógica de autenticación: valida credenciales, maneja el bloqueo por intentos
 * fallidos (RF01) y emite el token JWT.
 *
 * Nota: este método NO lleva @Transactional a propósito. Si se lanzara una
 * excepción dentro de una transacción, el contador de intentos fallidos se
 * revertiría y nunca se persistiría. Sin transacción, cada save() se confirma
 * de inmediato, así el intento fallido queda registrado aunque falle el login.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
}
