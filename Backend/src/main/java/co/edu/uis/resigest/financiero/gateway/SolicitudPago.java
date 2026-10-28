package co.edu.uis.resigest.financiero.gateway;

import java.math.BigDecimal;

/**
 * Datos que se envían a la pasarela para procesar un pago.
 */
public record SolicitudPago(
        String referencia,
        BigDecimal monto
) {
}
