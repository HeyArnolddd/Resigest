package co.edu.uis.resigest.comunicaciones.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.comunicaciones.dto.ComunicadoDTO;
import co.edu.uis.resigest.comunicaciones.dto.CrearComunicadoRequest;
import co.edu.uis.resigest.comunicaciones.service.ComunicadoService;
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
 * Endpoints de comunicados oficiales (RF08 · CU12).
 */
@RestController
@RequestMapping("/api/comunicados")
public class ComunicadoController {

    private final ComunicadoService comunicadoService;

    public ComunicadoController(ComunicadoService comunicadoService) {
        this.comunicadoService = comunicadoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComunicadoDTO> publicar(@Valid @RequestBody CrearComunicadoRequest request,
                                                  @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        ComunicadoDTO creado = comunicadoService.publicar(request, autenticado.getId());
        return ResponseEntity.created(URI.create("/api/comunicados/" + creado.id()))
                .body(creado);
    }

    @GetMapping
    public List<ComunicadoDTO> listar(@RequestParam(defaultValue = "false") boolean fijados) {
        return comunicadoService.listar(fijados);
    }
}
