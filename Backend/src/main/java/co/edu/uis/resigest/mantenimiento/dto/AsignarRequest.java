package co.edu.uis.resigest.mantenimiento.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarRequest(
        @NotNull(message = "El técnico es obligatorio")
        Long tecnicoId
) {
}
