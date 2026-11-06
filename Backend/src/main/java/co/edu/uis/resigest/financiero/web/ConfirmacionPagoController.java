package co.edu.uis.resigest.financiero.web;

import co.edu.uis.resigest.financiero.service.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Página de confirmación de PayU: PayU avisa aquí (POST de formulario) cuando un pago
 * cambia de estado, aunque el residente no vuelva a la página. Es pública, pero no le
 * cree al aviso: solo toma la referencia y vuelve a consultar el pago en PayU.
 */
@RestController
@RequestMapping("/api/pagos/en-linea")
public class ConfirmacionPagoController {

    private final PagoService pagoService;

    public ConfirmacionPagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping("/confirmacion")
    public ResponseEntity<Void> confirmacion(@RequestParam Map<String, String> aviso) {
        String referencia = aviso.get("reference_sale");
        if (referencia != null && !referencia.isBlank()) {
            pagoService.procesarConfirmacion(referencia);
        }
        return ResponseEntity.ok().build();
    }
}
