package co.edu.uis.resigest.common.exception;

/**
 * Se lanza cuando un usuario autenticado intenta acceder a un recurso que no
 * le pertenece. El {@link GlobalExceptionHandler} la traduce a HTTP 403.
 */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
