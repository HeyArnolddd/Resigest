package co.edu.uis.resigest.financiero.dto;

import co.edu.uis.resigest.financiero.domain.Pago;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de salida de un pago.
 */
public record PagoDTO(
        Long id,
        String metodo,
        BigDecimal monto,
        String estado,
        LocalDateTime fecha,
        Long obligacionId,
        String referencia
) {

    public static PagoDTO de(Pago pago) {
        return new PagoDTO(
                pago.getId(),
                pago.getMetodo().name(),
                pago.getMonto(),
                pago.getEstado().name(),
                pago.getFecha(),
                pago.getObligacion().getId(),
                pago.getReferencia()
        );
    }
}
