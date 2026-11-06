package co.edu.uis.resigest.financiero.dto;

import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Petición para generar las obligaciones de un mes.
 *
 * @param monto        valor general de la cuota
 * @param apartamentos opcional: a quiénes se les genera y, si se indica, con un valor propio.
 *                     Vacío o ausente = todos los apartamentos activos con el valor general.
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
        LocalDate fechaVencimiento,

        List<@Valid CuotaApartamento> apartamentos
) {

    /** Constructor de compatibilidad: cuota igual para todos los apartamentos activos. */
    public GenerarObligacionesRequest(String periodo, ConceptoCobro concepto, BigDecimal monto,
                                      LocalDate fechaVencimiento) {
        this(periodo, concepto, monto, fechaVencimiento, null);
    }

    /**
     * Apartamento al que se le genera la cuota.
     *
     * @param monto opcional: valor propio de este apartamento; si falta se usa el general
     */
    public record CuotaApartamento(
            @NotNull(message = "Falta el apartamento")
            Long apartamentoId,

            @Positive(message = "El valor debe ser positivo")
            BigDecimal monto
    ) {
    }
}
