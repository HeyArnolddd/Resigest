package co.edu.uis.resigest.reservas.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.reservas.dto.RechazoRequest;
import co.edu.uis.resigest.reservas.dto.ReservaDTO;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import co.edu.uis.resigest.reservas.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Endpoints de reservas (RF03/RF04 · CU03, CU07).
 */
@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<ReservaDTO> listar(@RequestParam Long zonaId) {
        return reservaService.listarPorZona(zonaId);
    }

    @PostMapping
    @PreAuthorize("hasRole('RESIDENTE')")
    public ResponseEntity<ReservaDTO> solicitar(@Valid @RequestBody SolicitudReservaRequest request,
                                                @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        ReservaDTO creada = reservaService.solicitar(request, autenticado.getId());
        return ResponseEntity.created(URI.create("/api/reservas/" + creada.id()))
                .body(creada);
    }

    @PatchMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservaDTO> aprobar(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.aprobar(id));
    }

    @PatchMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservaDTO> rechazar(@PathVariable Long id,
                                               @Valid @RequestBody RechazoRequest request) {
        return ResponseEntity.ok(reservaService.rechazar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESIDENTE')")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        reservaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
