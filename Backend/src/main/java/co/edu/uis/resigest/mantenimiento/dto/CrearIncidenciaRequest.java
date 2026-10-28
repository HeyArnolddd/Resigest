package co.edu.uis.resigest.mantenimiento.dto;

import co.edu.uis.resigest.mantenimiento.domain.PrioridadIncidencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearIncidenciaRequest(
        @NotBlank(message = "El título es obligatorio")
        @Size(max = 200, message = "El título no puede superar 200 caracteres")
        String titulo,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 1000, message = "La descripción no puede superar 1000 caracteres")
        String descripcion,

        @Size(max = 200, message = "La ubicación no puede superar 200 caracteres")
        String ubicacion,

        @NotNull(message = "La prioridad es obligatoria")
        PrioridadIncidencia prioridad
) {
}
