package co.edu.uis.resigest.porteria.web;

import co.edu.uis.resigest.porteria.dto.EntregaPaqueteRequest;
import co.edu.uis.resigest.porteria.dto.PaqueteDTO;
import co.edu.uis.resigest.porteria.dto.RegistrarPaqueteRequest;
import co.edu.uis.resigest.porteria.service.PaqueteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
 * Endpoints de paquetería.
 */
@RestController
@RequestMapping("/api/paquetes")
public class PaqueteController {

    private final PaqueteService paqueteService;

    public PaqueteController(PaqueteService paqueteService) {
        this.paqueteService = paqueteService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PORTERO')")
    public ResponseEntity<PaqueteDTO> registrar(@Valid @RequestBody RegistrarPaqueteRequest request) {
        PaqueteDTO creado = paqueteService.registrar(request);
        return ResponseEntity.created(URI.create("/api/paquetes/" + creado.id()))
                .body(creado);
    }

    @PatchMapping("/{id}/entrega")
    @PreAuthorize("hasRole('PORTERO')")
    public ResponseEntity<PaqueteDTO> entregar(@PathVariable Long id,
                                               @Valid @RequestBody EntregaPaqueteRequest request) {
        return ResponseEntity.ok(paqueteService.entregar(id, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO', 'RESIDENTE')")
    public List<PaqueteDTO> listar(@RequestParam Long apartamentoId) {
        return paqueteService.listarPorApartamento(apartamentoId);
    }
}
