package co.edu.uis.resigest.common.exception;

/**
 * Se lanza al violar una regla de negocio (residente moroso, coeficientes
 * que no suman 100 %, transición de estado inválida, etc.).
 * El {@link GlobalExceptionHandler} la traduce a HTTP 422.
 */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
