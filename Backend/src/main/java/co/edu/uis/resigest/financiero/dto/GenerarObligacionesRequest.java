package co.edu.uis.resigest.financiero.dto;

import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Petición para generar las obligaciones mensuales de todos los apartamentos.
 */
public record GenerarObligacionesRequest(
        @NotBlank(message = "El periodo es obligatorio")
        @Pattern(regexp = "\\d{4}-\\d{2}", message = "El periodo debe tener formato yyyy-MM")
        String periodo,

        @NotNull(message = "El concepto es obligatorio")
        ConceptoCobro concepto,

        @NotNull(message = "El monto es obligatorio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        @Future(message = "La fecha de vencimiento debe ser futura")
        LocalDate fechaVencimiento
) {
}
