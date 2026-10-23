package co.edu.uis.resigest.reservas.web;

import co.edu.uis.resigest.reservas.dto.CrearZonaComunRequest;
import co.edu.uis.resigest.reservas.dto.ZonaComunDTO;
import co.edu.uis.resigest.reservas.service.ZonaComunService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Endpoints de zonas comunes (RF03).
 */
@RestController
@RequestMapping("/api/zonas-comunes")
public class ZonaComunController {

    private final ZonaComunService zonaComunService;

    public ZonaComunController(ZonaComunService zonaComunService) {
        this.zonaComunService = zonaComunService;
    }

    @GetMapping
    public List<ZonaComunDTO> listar() {
        return zonaComunService.listar();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ZonaComunDTO> crear(@Valid @RequestBody CrearZonaComunRequest request) {
        ZonaComunDTO creada = zonaComunService.crear(request);
        return ResponseEntity.created(URI.create("/api/zonas-comunes/" + creada.id()))
                .body(creada);
    }
}
