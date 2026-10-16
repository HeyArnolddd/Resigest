package co.edu.uis.resigest.usuarios.dto;

/**
 * Respuesta del login: token JWT, rol y correo.
 */
public record TokenResponse(
        String token,
        String rol,
        String correo
) {
}
