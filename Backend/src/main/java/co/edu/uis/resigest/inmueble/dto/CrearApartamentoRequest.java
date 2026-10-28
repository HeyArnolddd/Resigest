package co.edu.uis.resigest.inmueble.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * DTO de entrada para crear un apartamento. Las anotaciones de validación
 * se evalúan antes de llegar al servicio (nivel de "formato").
 */
public record CrearApartamentoRequest(
        @NotNull(message = "La torre es obligatoria")
        Long torreId,

        @NotBlank(message = "El número es obligatorio")
        @Size(max = 20, message = "El número no puede superar 20 caracteres")
        String numero,

        @NotNull(message = "El piso es obligatorio")
        @PositiveOrZero(message = "El piso debe ser 0 o mayor")
        Integer piso,

        @NotNull(message = "El coeficiente es obligatorio")
        @Positive(message = "El coeficiente debe ser positivo")
        @Digits(integer = 3, fraction = 4, message = "Coeficiente inválido (máx. 999.9999)")
        BigDecimal coeficienteCopropiedad
) {
}
