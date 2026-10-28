package co.edu.uis.resigest.common.exception;

/**
 * Se lanza ante credenciales inválidas, cuenta bloqueada o cuenta inactiva.
 * El {@link GlobalExceptionHandler} la traduce a HTTP 401.
 */
public class AutenticacionException extends RuntimeException {

    public AutenticacionException(String mensaje) {
        super(mensaje);
    }
}
