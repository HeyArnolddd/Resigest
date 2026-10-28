package co.edu.uis.resigest.financiero.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Estado de cuenta de un apartamento: obligaciones y total pendiente.
 */
public record EstadoCuentaDTO(
        Long apartamentoId,
        String apartamento,
        BigDecimal totalPendiente,
        List<ObligacionDTO> obligaciones
) {
}
