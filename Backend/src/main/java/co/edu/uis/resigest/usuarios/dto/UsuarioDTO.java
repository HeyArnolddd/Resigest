package co.edu.uis.resigest.usuarios.dto;

import co.edu.uis.resigest.usuarios.domain.Rol;

/**
 * DTO de salida de un usuario. Nunca incluye el hash de la contraseña.
 */
public record UsuarioDTO(
        Long id,
        String nombreCompleto,
        String correo,
        String documento,
        String telefono,
        boolean activo,
        Rol rol
) {
}
