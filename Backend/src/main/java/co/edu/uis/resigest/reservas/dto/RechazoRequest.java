package co.edu.uis.resigest.reservas.dto;

import jakarta.validation.constraints.NotBlank;

public record RechazoRequest(
        @NotBlank(message = "La justificación es obligatoria")
        String justificacion
) {
}
