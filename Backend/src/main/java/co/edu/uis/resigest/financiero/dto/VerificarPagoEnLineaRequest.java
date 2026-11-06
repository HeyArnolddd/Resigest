package co.edu.uis.resigest.financiero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Referencia del pago con la que PayU devuelve al residente ({@code ?referenceCode=...}).
 */
public record VerificarPagoEnLineaRequest(
        @NotBlank(message = "Falta la referencia del pago")
        @Size(max = 100)
        String referencia
) {
}
