package co.edu.uis.resigest.financiero.web;

import co.edu.uis.resigest.financiero.dto.WebhookPagoRequest;
import co.edu.uis.resigest.financiero.service.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Recibe la confirmación asíncrona de la pasarela (Wompi). Es público.
 */
@RestController
@RequestMapping("/api/pagos")
public class WebhookController {

    private final PagoService pagoService;

    public WebhookController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody WebhookPagoRequest request) {
        pagoService.procesarWebhook(request);
        return ResponseEntity.ok().build();
    }
}
