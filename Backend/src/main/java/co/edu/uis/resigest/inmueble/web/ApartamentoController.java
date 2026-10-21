package co.edu.uis.resigest.inmueble.web;

import co.edu.uis.resigest.financiero.dto.EstadoCuentaDTO;
import co.edu.uis.resigest.financiero.service.CarteraService;
import co.edu.uis.resigest.inmueble.dto.ApartamentoDTO;
import co.edu.uis.resigest.inmueble.dto.CrearApartamentoRequest;
import co.edu.uis.resigest.inmueble.service.ApartamentoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Expone los apartamentos por HTTP. Solo traduce HTTP ↔ servicio:
 * recibe, delega y devuelve. Sin lógica de negocio.
 */
@RestController
@RequestMapping("/api/apartamentos")
public class ApartamentoController {

    private final ApartamentoService apartamentoService;
    private final CarteraService carteraService;

    public ApartamentoController(ApartamentoService apartamentoService,
                                 CarteraService carteraService) {
        this.apartamentoService = apartamentoService;
        this.carteraService = carteraService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApartamentoDTO> crear(@Valid @RequestBody CrearApartamentoRequest request) {
        ApartamentoDTO creado = apartamentoService.crear(request);
        return ResponseEntity.created(URI.create("/api/apartamentos/" + creado.id()))
                .body(creado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApartamentoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(apartamentoService.obtener(id));
    }

    @GetMapping("/{id}/estado-cuenta")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESIDENTE')")
    public ResponseEntity<EstadoCuentaDTO> estadoCuenta(@PathVariable Long id) {
        return ResponseEntity.ok(carteraService.estadoCuenta(id));
    }

    @GetMapping
    public List<ApartamentoDTO> listar() {
        return apartamentoService.listar();
    }
}
