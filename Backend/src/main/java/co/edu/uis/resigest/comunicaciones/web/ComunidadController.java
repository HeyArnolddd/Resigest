package co.edu.uis.resigest.comunicaciones.web;

import co.edu.uis.resigest.comunicaciones.domain.Evento;
import co.edu.uis.resigest.comunicaciones.dto.ContactoDTO;
import co.edu.uis.resigest.comunicaciones.dto.CrearEventoRequest;
import co.edu.uis.resigest.comunicaciones.dto.EventoDTO;
import co.edu.uis.resigest.comunicaciones.repository.ContactoRepository;
import co.edu.uis.resigest.comunicaciones.repository.EventoRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

/**
 * Agenda de eventos y directorio de contactos del conjunto.
 */
@RestController
@RequestMapping("/api")
public class ComunidadController {

    private final EventoRepository eventoRepository;
    private final ContactoRepository contactoRepository;

    public ComunidadController(EventoRepository eventoRepository, ContactoRepository contactoRepository) {
        this.eventoRepository = eventoRepository;
        this.contactoRepository = contactoRepository;
    }

    @GetMapping("/eventos")
    @Transactional(readOnly = true)
    public List<EventoDTO> eventos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now();
        LocalDate h = hasta != null ? hasta : d.plusMonths(3);
        return eventoRepository.findByFechaBetweenOrderByFechaAsc(d.atStartOfDay(), h.plusDays(1).atStartOfDay())
                .stream().map(EventoDTO::de).toList();
    }

    @PostMapping("/eventos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional
    public ResponseEntity<EventoDTO> crearEvento(@Valid @RequestBody CrearEventoRequest request) {
        Evento evento = eventoRepository.save(new Evento(
                request.titulo(), request.descripcion(), request.fecha(), request.lugar(), request.tipo()));
        return ResponseEntity.created(URI.create("/api/eventos/" + evento.getId())).body(EventoDTO.de(evento));
    }

    @GetMapping("/contactos")
    @Transactional(readOnly = true)
    public List<ContactoDTO> contactos() {
        return contactoRepository.findAllByOrderByCategoriaAscNombreAsc().stream().map(ContactoDTO::de).toList();
    }
}
