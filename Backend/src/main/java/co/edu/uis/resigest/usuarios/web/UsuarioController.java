package co.edu.uis.resigest.usuarios.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.dto.ActualizarUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.CambiarContrasenaRequest;
import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.CredencialesDTO;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;
import co.edu.uis.resigest.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

/**
 * Gestión de usuarios (CU05). Todo requiere rol ADMINISTRADOR, salvo /me.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioDTO> registrar(@Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioDTO creado = usuarioService.registrar(request);
        return ResponseEntity.created(URI.create("/api/usuarios/" + creado.id()))
                .body(creado);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Page<UsuarioDTO> listar(@RequestParam(required = false) Rol rol,
                                   @RequestParam(required = false) String q,
                                   @RequestParam(required = false) Boolean activo,
                                   @PageableDefault(size = 20, sort = "nombreCompleto",
                                           direction = Sort.Direction.ASC) Pageable pageable) {
        return usuarioService.listar(rol, q, activo, pageable);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> perfil(@AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(usuarioService.obtener(autenticado.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioDTO obtener(@PathVariable Long id) {
        return usuarioService.obtener(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioDTO actualizar(@PathVariable Long id,
                                 @Valid @RequestBody ActualizarUsuarioRequest request) {
        return usuarioService.actualizar(id, request);
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        usuarioService.activar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id,
                                           @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        usuarioService.desactivar(id, autenticado.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
                                         @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        usuarioService.eliminar(id, autenticado.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/contrasena")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> cambiarContrasena(@PathVariable Long id,
                                                  @Valid @RequestBody CambiarContrasenaRequest request) {
        usuarioService.cambiarContrasena(id, request.contrasena());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/credenciales")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public CredencialesDTO credenciales(@PathVariable Long id) {
        return usuarioService.credenciales(id);
    }
}
