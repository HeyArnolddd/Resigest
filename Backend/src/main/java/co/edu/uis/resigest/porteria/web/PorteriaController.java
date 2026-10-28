package co.edu.uis.resigest.porteria.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.porteria.dto.RegistrarIngresoRequest;
import co.edu.uis.resigest.porteria.dto.RegistroIngresoDTO;
import co.edu.uis.resigest.porteria.service.PorteriaService;
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

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

/**
 * Endpoints de portería (RF05 · CU04).
 */
@RestController
@RequestMapping("/api/porteria")
public class PorteriaController {

    private final PorteriaService porteriaService;

    public PorteriaController(PorteriaService porteriaService) {
        this.porteriaService = porteriaService;
    }

    @PostMapping("/ingresos")
    @PreAuthorize("hasRole('PORTERO')")
    public ResponseEntity<RegistroIngresoDTO> registrarIngreso(
            @Valid @RequestBody RegistrarIngresoRequest request,
            @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        RegistroIngresoDTO creado = porteriaService.registrarIngreso(request, autenticado.getId());
        return ResponseEntity.created(URI.create("/api/porteria/ingresos/" + creado.id()))
                .body(creado);
    }

    @PatchMapping("/ingresos/{id}/salida")
    @PreAuthorize("hasRole('PORTERO')")
    public ResponseEntity<Void> registrarSalida(@PathVariable Long id) {
        porteriaService.registrarSalida(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bitacora")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RegistroIngresoDTO> bitacora(@RequestParam LocalDate desde,
                                             @RequestParam LocalDate hasta) {
        return porteriaService.consultarBitacora(desde, hasta);
    }
}
