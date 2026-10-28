package co.edu.uis.resigest.inmueble.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * DTO de entrada para crear una torre.
 */
public record CrearTorreRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @NotNull(message = "El número de pisos es obligatorio")
        @Positive(message = "El número de pisos debe ser positivo")
        Integer numeroPisos
) {
}
