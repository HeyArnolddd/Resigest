package co.edu.uis.resigest.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Única clase del proyecto que decide qué código HTTP devolver ante cada error.
 * Traduce las excepciones de negocio a respuestas {@link ApiError} consistentes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ApiError> manejarNoEncontrado(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.de(404, "RECURSO_NO_ENCONTRADO", ex.getMessage()));
    }

    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<ApiError> manejarConflicto(ConflictoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "CONFLICTO", ex.getMessage()));
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ApiError> manejarReglaNegocio(ReglaNegocioException ex) {
        return ResponseEntity.status(HttpStatusCode.valueOf(422))
                .body(ApiError.de(422, "REGLA_NEGOCIO", ex.getMessage()));
    }

    @ExceptionHandler(AutenticacionException.class)
    public ResponseEntity<ApiError> manejarAutenticacion(AutenticacionException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.de(401, "NO_AUTORIZADO", ex.getMessage()));
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ApiError> manejarAccesoDenegado(AccesoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.de(403, "ACCESO_DENEGADO", ex.getMessage()));
    }

    // @PreAuthorize rechazado (rol insuficiente). Sin esto caería en el manejador genérico como 500.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> manejarRolInsuficiente(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.de(403, "ACCESO_DENEGADO", "No tienes permiso para realizar esta acción"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(ApiError.conErroresDeCampo(400, "VALIDACION", "Datos inválidos", errores));
    }

    // Errores propios de Spring MVC (ruta inexistente, método no permitido, etc.): conservan su código.
    @ExceptionHandler({NoResourceFoundException.class, HttpRequestMethodNotSupportedException.class,
            ErrorResponseException.class})
    public ResponseEntity<ApiError> manejarErrorMvc(Exception ex) {
        int codigo = ((ErrorResponse) ex).getStatusCode().value();
        String mensaje = codigo == 404 ? "La ruta no existe" : "Petición no válida";
        return ResponseEntity.status(codigo).body(ApiError.de(codigo, "PETICION", mensaje));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> manejarGenerico(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.de(500, "ERROR_INTERNO", "Error interno del servidor"));
    }
}
