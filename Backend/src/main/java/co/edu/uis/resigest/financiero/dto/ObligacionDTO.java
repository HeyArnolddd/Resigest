package co.edu.uis.resigest.financiero.dto;

import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de salida de una obligación financiera.
 */
public record ObligacionDTO(
        Long id,
        String concepto,
        String periodo,
        BigDecimal montoTotal,
        BigDecimal saldoPendiente,
        String estado,
        LocalDate fechaVencimiento,
        Long apartamentoId,
        String apartamento
) {

    public static ObligacionDTO de(ObligacionFinanciera obligacion) {
        return new ObligacionDTO(
                obligacion.getId(),
                obligacion.getConcepto().name(),
                obligacion.getPeriodo(),
                obligacion.getMontoTotal(),
                obligacion.getSaldoPendiente(),
                obligacion.getEstado().name(),
                obligacion.getFechaVencimiento(),
                obligacion.getApartamento().getId(),
                obligacion.getApartamento().identificadorCompleto()
        );
    }
}
