package co.edu.uis.resigest.usuarios.web;

import co.edu.uis.resigest.usuarios.dto.LoginRequest;
import co.edu.uis.resigest.usuarios.dto.RecuperarContrasenaRequest;
import co.edu.uis.resigest.usuarios.dto.RestablecerContrasenaRequest;
import co.edu.uis.resigest.usuarios.dto.TokenResponse;
import co.edu.uis.resigest.usuarios.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints públicos de autenticación y recuperación de contraseña.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.autenticar(request));
    }

    @PostMapping("/recuperar")
    public ResponseEntity<Void> recuperar(@Valid @RequestBody RecuperarContrasenaRequest request) {
        authService.solicitarRecuperacion(request.correo());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/restablecer")
    public ResponseEntity<Void> restablecer(@Valid @RequestBody RestablecerContrasenaRequest request) {
        authService.restablecerContrasena(request.token(), request.nuevaContrasena());
        return ResponseEntity.ok().build();
    }
}
