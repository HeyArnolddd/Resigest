package co.edu.uis.resigest.inmueble.web;

import co.edu.uis.resigest.inmueble.dto.CrearTorreRequest;
import co.edu.uis.resigest.inmueble.dto.TorreDTO;
import co.edu.uis.resigest.inmueble.service.TorreService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Expone las torres por HTTP. Solo recibe, delega y devuelve.
 */
@RestController
@RequestMapping("/api/torres")
public class TorreController {

    private final TorreService torreService;

    public TorreController(TorreService torreService) {
        this.torreService = torreService;
    }

    @PostMapping
    public ResponseEntity<TorreDTO> crear(@Valid @RequestBody CrearTorreRequest request) {
        TorreDTO creada = torreService.crear(request);
        return ResponseEntity.created(URI.create("/api/torres/" + creada.id()))
                .body(creada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TorreDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(torreService.obtener(id));
    }

    @GetMapping
    public List<TorreDTO> listar() {
        return torreService.listar();
    }
}
