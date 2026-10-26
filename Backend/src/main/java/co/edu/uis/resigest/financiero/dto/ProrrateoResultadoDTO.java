package co.edu.uis.resigest.financiero.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProrrateoResultadoDTO(
        Long facturaId,
        String periodo,
        BigDecimal total,
        List<ProrrateoDetalleDTO> detalles
) {
}
