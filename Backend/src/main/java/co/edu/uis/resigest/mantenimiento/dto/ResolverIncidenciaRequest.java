package co.edu.uis.resigest.mantenimiento.dto;

import jakarta.validation.constraints.Size;

/**
 * Solución de una incidencia. Que la solución y la foto sean obligatorias es una regla de negocio
 * de {@code Incidencia.resolver}: si faltan responde 422 con el motivo, no 400.
 */
public record ResolverIncidenciaRequest(
        @Size(max = 1000, message = "La solución no puede superar 1000 caracteres")
        String solucion,

        /** Foto del trabajo terminado, subida antes con POST /api/archivos. */
        @Size(max = 300, message = "La dirección de la foto es demasiado larga")
        String fotoUrl
) {
}
