package co.edu.uis.resigest.financiero.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Petición del administrador para aprobar o rechazar un pago manual.
 */
public record ValidarPagoRequest(
        @NotNull(message = "Indica si se aprueba o rechaza")
        Boolean aprobar,

        String motivo
) {
}
