package co.edu.uis.resigest.mantenimiento.dto;

import jakarta.validation.constraints.NotBlank;

public record ResolverIncidenciaRequest(
        @NotBlank(message = "La solución es obligatoria")
        String solucion
) {
}
