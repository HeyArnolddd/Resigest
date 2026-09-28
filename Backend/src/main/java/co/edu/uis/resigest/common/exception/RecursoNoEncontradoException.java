package co.edu.uis.resigest.common.exception;

/**
 * Se lanza cuando un {@code findById} no encuentra el recurso.
 * El {@link GlobalExceptionHandler} la traduce a HTTP 404.
 */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
