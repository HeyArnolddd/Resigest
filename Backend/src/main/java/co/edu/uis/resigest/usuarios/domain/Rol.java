package co.edu.uis.resigest.usuarios.domain;

/**
 * Roles del sistema. Cada subclase de {@link Usuario} define cuál le corresponde.
 */
public enum Rol {
    RESIDENTE,
    ADMINISTRADOR,
    PORTERO,
    MANTENIMIENTO;

    /**
     * Portería y mantenimiento: cuentas creadas por el administrador, que puede
     * consultar sus credenciales.
     */
    public boolean esPersonalOperativo() {
        return this == PORTERO || this == MANTENIMIENTO;
    }
}
