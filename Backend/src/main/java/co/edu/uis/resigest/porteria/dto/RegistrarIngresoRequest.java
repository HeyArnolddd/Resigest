package co.edu.uis.resigest.porteria.dto;

import co.edu.uis.resigest.porteria.domain.TipoIngreso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistrarIngresoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 200, message = "El nombre no puede superar 200 caracteres")
        String nombreVisitante,

        @Size(max = 50, message = "El documento no puede superar 50 caracteres")
        String documento,

        @NotNull(message = "El tipo es obligatorio")
        TipoIngreso tipo,

        @Size(max = 100, message = "La empresa no puede superar 100 caracteres")
        String empresa,

        @NotNull(message = "El apartamento de destino es obligatorio")
        Long apartamentoDestinoId
) {
}
