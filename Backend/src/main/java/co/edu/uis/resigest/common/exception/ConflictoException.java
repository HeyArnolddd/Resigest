package co.edu.uis.resigest.common.exception;

/**
 * Se lanza ante un choque de concurrencia o un conflicto (zona ya reservada,
 * correo duplicado, etc.). El {@link GlobalExceptionHandler} la traduce a HTTP 409.
 */
public class ConflictoException extends RuntimeException {

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}
