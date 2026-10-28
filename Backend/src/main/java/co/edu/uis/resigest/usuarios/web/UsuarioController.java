package co.edu.uis.resigest.usuarios.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;
import co.edu.uis.resigest.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Gestión de usuarios (CU05). Registrar y listar requieren rol ADMIN.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> registrar(@Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioDTO creado = usuarioService.registrar(request);
        return ResponseEntity.created(URI.create("/api/usuarios/" + creado.id()))
                .body(creado);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioDTO> listar(@RequestParam(required = false) Rol rol) {
        return usuarioService.listar(rol);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> perfil(@AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(usuarioService.obtener(autenticado.getId()));
    }
}
