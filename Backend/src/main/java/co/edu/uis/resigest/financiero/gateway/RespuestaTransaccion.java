package co.edu.uis.resigest.financiero.gateway;

/**
 * Resultado devuelto por la pasarela tras intentar cobrar.
 */
public record RespuestaTransaccion(
        boolean aprobada,
        String idTransaccion,
        String urlRecibo
) {
}
