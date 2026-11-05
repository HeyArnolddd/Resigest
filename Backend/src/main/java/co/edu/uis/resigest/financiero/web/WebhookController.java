package co.edu.uis.resigest.financiero.web;

import co.edu.uis.resigest.financiero.dto.WebhookPagoRequest;
import co.edu.uis.resigest.financiero.service.PagoService;
import co.edu.uis.resigest.common.exception.AutenticacionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Recibe la confirmación asíncrona de la pasarela (Wompi). Es público, pero exige la cabecera
 * {@code X-Signature} = HMAC-SHA256 hex de {@code idTransaccion:aprobada} con {@code app.webhook.secret}.
 */
@RestController
@RequestMapping("/api/pagos")
public class WebhookController {

    private final PagoService pagoService;

    private final String secreto;

    public WebhookController(PagoService pagoService, @Value("${app.webhook.secret:}") String secreto) {
        this.pagoService = pagoService;
        this.secreto = secreto;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody WebhookPagoRequest request,
                                        @RequestHeader(value = "X-Signature", required = false) String firma) {
        verificarFirma(request, firma);
        pagoService.procesarWebhook(request);
        return ResponseEntity.ok().build();
    }

    private void verificarFirma(WebhookPagoRequest request, String firma) {
        if (secreto.isBlank() || firma == null) {
            throw new AutenticacionException("Firma del webhook inválida");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String payload = request.idTransaccion() + ":" + request.aprobada();
            byte[] esperada = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] recibida = HexFormat.of().parseHex(firma.trim());
            if (!MessageDigest.isEqual(esperada, recibida)) {
                throw new AutenticacionException("Firma del webhook inválida");
            }
        } catch (AutenticacionException e) {
            throw e;
        } catch (Exception e) {
            throw new AutenticacionException("Firma del webhook inválida");
        }
    }
}
