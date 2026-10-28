package co.edu.uis.resigest.financiero.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Petición para iniciar un pago por pasarela sobre una obligación.
 */
public record IniciarPagoRequest(
        @NotNull(message = "La obligación es obligatoria")
        Long obligacionId
) {
}
