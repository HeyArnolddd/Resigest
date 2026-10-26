package co.edu.uis.resigest.financiero.dto;

import co.edu.uis.resigest.financiero.domain.TipoServicio;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ProrrateoRequest(
        @NotNull(message = "El tipo de servicio es obligatorio")
        TipoServicio tipo,

        @NotBlank(message = "El periodo es obligatorio")
        @Pattern(regexp = "\\d{4}-\\d{2}", message = "El periodo debe tener formato yyyy-MM")
        String periodo,

        @NotNull(message = "El total es obligatorio")
        @Positive(message = "El total debe ser positivo")
        BigDecimal total
) {
}
