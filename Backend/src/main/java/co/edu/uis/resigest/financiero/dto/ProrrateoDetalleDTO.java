package co.edu.uis.resigest.financiero.dto;

import java.math.BigDecimal;

public record ProrrateoDetalleDTO(
        Long apartamentoId,
        String apartamento,
        BigDecimal coeficiente,
        BigDecimal valor
) {
}
