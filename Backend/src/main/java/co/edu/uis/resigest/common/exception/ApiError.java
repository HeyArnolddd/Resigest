package co.edu.uis.resigest.common.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Formato único de error que devuelve la API en todas las respuestas fallidas.
 * El frontend solo necesita aprender esta estructura una vez.
 */
public record ApiError(
        LocalDateTime timestamp,
        int estado,
        String codigo,
        String mensaje,
        Map<String, String> erroresCampo
) {

    public static ApiError de(int estado, String codigo, String mensaje) {
        return new ApiError(LocalDateTime.now(), estado, codigo, mensaje, Map.of());
    }

    public static ApiError conErroresDeCampo(int estado, String codigo, String mensaje,
                                             Map<String, String> erroresCampo) {
        return new ApiError(LocalDateTime.now(), estado, codigo, mensaje, erroresCampo);
    }
}
