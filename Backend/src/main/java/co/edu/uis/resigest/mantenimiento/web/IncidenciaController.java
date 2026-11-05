package co.edu.uis.resigest.mantenimiento.web;

import java.util.List;
import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.mantenimiento.dto.AsignarRequest;
import co.edu.uis.resigest.mantenimiento.dto.CrearIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.dto.IncidenciaDTO;
import co.edu.uis.resigest.mantenimiento.dto.ResolverIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.service.IncidenciaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'MANTENIMIENTO')")
    public Page<IncidenciaDTO> listar(@PageableDefault(size = 50, sort = "fechaCreacion",
            direction = Sort.Direction.DESC) Pageable pageable) {
        return incidenciaService.listar(pageable);
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
    @PreAuthorize("hasAnyRole('RESIDENTE', 'PORTERO')")
    public ResponseEntity<IncidenciaDTO> agregarEvidencia(@PathVariable Long id,
                                                          @RequestParam("archivo") MultipartFile archivo,
                                                          @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(incidenciaService.agregarEvidencia(id, archivo, autenticado.getId()));
    }

    @PatchMapping("/{id}/asignacion")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<IncidenciaDTO> asignar(@PathVariable Long id,
                                                 @Valid @RequestBody AsignarRequest request) {
        return ResponseEntity.ok(incidenciaService.asignar(id, request));
    }

    @PatchMapping("/{id}/solucion")
    @PreAuthorize("hasRole('MANTENIMIENTO')")
    public ResponseEntity<IncidenciaDTO> resolver(@PathVariable Long id,
                                                  @Valid @RequestBody ResolverIncidenciaRequest request,
                                                  @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(incidenciaService.resolver(id, request, autenticado.getId()));
    }

    @PatchMapping("/{id}/inicio")
    @PreAuthorize("hasRole('MANTENIMIENTO')")
    public ResponseEntity<IncidenciaDTO> iniciar(@PathVariable Long id,
                                                 @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(incidenciaService.iniciar(id, autenticado.getId()));
    }

    @GetMapping("/mias")
    @PreAuthorize("hasAnyRole('RESIDENTE', 'PORTERO')")
    public List<IncidenciaDTO> mias(@AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return incidenciaService.listarReportadasPor(autenticado.getId());
    }

    @GetMapping("/asignadas")
    @PreAuthorize("hasRole('MANTENIMIENTO')")
    public List<IncidenciaDTO> asignadas(@AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return incidenciaService.listarAsignadasA(autenticado.getId());
    }
}
