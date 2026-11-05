package co.edu.uis.resigest.financiero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;

/**
 * Petición para reportar un pago por transferencia manual con su comprobante.
 */
public record ReportarPagoManualRequest(
        @NotNull(message = "La obligación es obligatoria")
        Long obligacionId,

        @NotBlank(message = "El comprobante adjunto es obligatorio")
        String urlComprobanteAdjunto,

        @Size(max = 100, message = "La referencia no puede superar 100 caracteres")
        String referencia
) {
}
