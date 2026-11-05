package co.edu.uis.resigest.mantenimiento.dto;

import jakarta.validation.constraints.NotBlank;

public record ResolverIncidenciaRequest(
        @NotBlank(message = "La solución es obligatoria")
        String solucion,

        /** Foto del trabajo terminado, subida antes con POST /api/archivos. */
        @NotBlank(message = "Adjunta una foto del trabajo terminado")
        String fotoUrl
) {
}
