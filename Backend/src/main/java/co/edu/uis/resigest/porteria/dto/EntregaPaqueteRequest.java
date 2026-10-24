package co.edu.uis.resigest.porteria.dto;

import jakarta.validation.constraints.NotBlank;

public record EntregaPaqueteRequest(
        @NotBlank(message = "Indica quién recibe el paquete")
        String entregadoA
) {
}
