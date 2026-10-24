package co.edu.uis.resigest.mantenimiento.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.mantenimiento.dto.AsignarRequest;
import co.edu.uis.resigest.mantenimiento.dto.CrearIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.dto.IncidenciaDTO;
import co.edu.uis.resigest.mantenimiento.dto.ResolverIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.service.IncidenciaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

/**
 * Endpoints de incidencias (RF06 · CU08, CU09).
 */
@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANTENIMIENTO')")
    public List<IncidenciaDTO> listar() {
        return incidenciaService.listar();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESIDENTE', 'PORTERO')")
    public ResponseEntity<IncidenciaDTO> reportar(@Valid @RequestBody CrearIncidenciaRequest request,
                                                  @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        IncidenciaDTO creada = incidenciaService.reportar(request, autenticado.getId());
        return ResponseEntity.created(URI.create("/api/incidencias/" + creada.id()))
                .body(creada);
    }

    @PostMapping("/{id}/evidencias")
    @PreAuthorize("hasRole('RESIDENTE')")
    public ResponseEntity<IncidenciaDTO> agregarEvidencia(@PathVariable Long id,
                                                          @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(incidenciaService.agregarEvidencia(id, archivo));
    }

    @PatchMapping("/{id}/asignacion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IncidenciaDTO> asignar(@PathVariable Long id,
                                                 @Valid @RequestBody AsignarRequest request) {
        return ResponseEntity.ok(incidenciaService.asignar(id, request));
    }

    @PatchMapping("/{id}/solucion")
    @PreAuthorize("hasRole('MANTENIMIENTO')")
    public ResponseEntity<IncidenciaDTO> resolver(@PathVariable Long id,
                                                  @Valid @RequestBody ResolverIncidenciaRequest request) {
        return ResponseEntity.ok(incidenciaService.resolver(id, request));
    }
}
