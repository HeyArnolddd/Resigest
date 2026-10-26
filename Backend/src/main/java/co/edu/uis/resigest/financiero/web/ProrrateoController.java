package co.edu.uis.resigest.financiero.web;

import co.edu.uis.resigest.financiero.dto.ProrrateoDetalleDTO;
import co.edu.uis.resigest.financiero.dto.ProrrateoRequest;
import co.edu.uis.resigest.financiero.dto.ProrrateoResultadoDTO;
import co.edu.uis.resigest.financiero.service.ProrrateoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints de prorrateo de servicios comunes (RF07 · CU10).
 */
@RestController
@RequestMapping("/api/servicios/prorrateo")
public class ProrrateoController {

    private final ProrrateoService prorrateoService;

    public ProrrateoController(ProrrateoService prorrateoService) {
        this.prorrateoService = prorrateoService;
    }

    @PostMapping("/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProrrateoDetalleDTO> preview(@Valid @RequestBody ProrrateoRequest request) {
        return prorrateoService.preview(request);
    }

    @PostMapping("/confirmar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProrrateoResultadoDTO> confirmar(@Valid @RequestBody ProrrateoRequest request) {
        return ResponseEntity.ok(prorrateoService.confirmar(request));
    }
}
