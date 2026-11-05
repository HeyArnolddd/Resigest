package co.edu.uis.resigest.comunicaciones.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.comunicaciones.dto.CrearEventoRequest;
import co.edu.uis.resigest.comunicaciones.dto.EventoDTO;
import co.edu.uis.resigest.comunicaciones.service.EventoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
 * Agenda del conjunto. Todos los usuarios la ven; solo la administración la edita.
 */
@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    /** Eventos desde la fecha indicada (por defecto, hoy). */
    @GetMapping
    public List<EventoDTO> proximos(@RequestParam(required = false)
                                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde) {
        return eventoService.proximos(desde != null ? desde : LocalDate.now());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<EventoDTO> crear(@Valid @RequestBody CrearEventoRequest request,
                                           @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        EventoDTO creado = eventoService.crear(request, autenticado.getId());
        return ResponseEntity.created(URI.create("/api/eventos/" + creado.id())).body(creado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        eventoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
