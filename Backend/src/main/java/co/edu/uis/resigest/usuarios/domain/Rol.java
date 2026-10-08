package co.edu.uis.resigest.usuarios.domain;

/**
 * Roles del sistema. Cada subclase de {@link Usuario} define cuál le corresponde.
 */
public enum Rol {
    RESIDENTE,
    ADMINISTRADOR,
    PORTERO,
    MANTENIMIENTO
}
