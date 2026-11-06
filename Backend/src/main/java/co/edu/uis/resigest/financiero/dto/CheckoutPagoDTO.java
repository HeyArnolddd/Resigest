package co.edu.uis.resigest.financiero.dto;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Orden firmada para abrir la página de pago de PayU (WebCheckout).
 * El frontend envía {@code campos} por POST a {@code urlCheckout}.
 */
public record CheckoutPagoDTO(
        Long pagoId,
        String referencia,
        BigDecimal monto,
        String urlCheckout,
        Map<String, String> campos
) {
}
