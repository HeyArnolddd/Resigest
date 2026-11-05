package co.edu.uis.resigest.usuarios.dto;

/**
 * Credenciales de acceso del personal operativo, visibles solo para el
 * administrador. {@code contrasena} va en null si no hay copia guardada
 * (cuentas creadas antes de esta función): en ese caso hay que restablecerla.
 */
public record CredencialesDTO(
        String correo,
        String contrasena
) {
}
