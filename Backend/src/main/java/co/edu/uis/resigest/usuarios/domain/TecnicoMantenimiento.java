package co.edu.uis.resigest.usuarios.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Personal de mantenimiento: atiende y resuelve incidencias.
 */
@Entity
@Table(name = "tecnico_mantenimiento")
@Getter
@Setter
public class TecnicoMantenimiento extends Usuario {

    private String especialidad;

    protected TecnicoMantenimiento() {
        // Constructor sin argumentos para JPA.
    }

    public TecnicoMantenimiento(String nombreCompleto, String correo, String contrasenaHash,
                                String documento, String telefono, String especialidad) {
        super(nombreCompleto, correo, contrasenaHash, documento, telefono);
        this.especialidad = especialidad;
    }

    @Override
    public Rol getRol() {
        return Rol.MANTENIMIENTO;
    }

    /**
     * Un técnico está disponible si su cuenta está activa.
     */
    public boolean estaDisponible() {
        return isActivo();
    }
}
