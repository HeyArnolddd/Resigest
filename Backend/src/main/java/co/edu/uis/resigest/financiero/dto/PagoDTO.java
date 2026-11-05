package co.edu.uis.resigest.financiero.dto;

import co.edu.uis.resigest.financiero.domain.Pago;

import co.edu.uis.resigest.financiero.domain.PagoManual;
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
        String referencia,
        Long apartamentoId,
        String apartamento,
        String concepto,
        String periodo,
        String urlComprobanteAdjunto,
        String motivoRechazo
) {

    public static PagoDTO de(Pago pago) {
        return new PagoDTO(
                pago.getId(),
                pago.getMetodo().name(),
                pago.getMonto(),
                pago.getEstado().name(),
                pago.getFecha(),
                pago.getObligacion().getId(),
                pago.getReferencia(),
                pago.getObligacion().getApartamento().getId(),
                pago.getObligacion().getApartamento().identificadorCompleto(),
                pago.getObligacion().getConcepto().name(),
                pago.getObligacion().getPeriodo(),
                pago instanceof PagoManual m ? m.getUrlComprobanteAdjunto() : null,
                pago.getMotivoRechazo()
        );
    }
}
