package co.edu.uis.resigest.financiero.web;

import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.dto.GenerarObligacionesRequest;
import co.edu.uis.resigest.financiero.dto.ObligacionDTO;
import co.edu.uis.resigest.financiero.service.CarteraService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints de cartera: listar obligaciones, generarlas y forzar vencimiento.
 */
@RestController
@RequestMapping("/api/obligaciones")
public class ObligacionController {

    private final CarteraService carteraService;

    public ObligacionController(CarteraService carteraService) {
        this.carteraService = carteraService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESIDENTE')")
    public List<ObligacionDTO> listar(@RequestParam(required = false) Long apartamentoId,
                                      @RequestParam(required = false) EstadoObligacion estado) {
        return carteraService.listarObligaciones(apartamentoId, estado);
    }

    @PostMapping("/generar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ObligacionDTO>> generar(
            @Valid @RequestBody GenerarObligacionesRequest request) {
        List<ObligacionDTO> creadas = carteraService.generarObligacionesMensuales(request);
        return ResponseEntity.ok(creadas);
    }

    /** Útil para probar el vencimiento sin esperar al cron de las 3 AM. */
    @PostMapping("/marcar-vencidas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> marcarVencidas() {
        carteraService.marcarVencidas();
        return ResponseEntity.noContent().build();
    }
}
