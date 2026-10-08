package co.edu.uis.resigest.usuarios.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Portero: control de acceso en la recepción.
 */
@Entity
@Table(name = "portero")
@Getter
@Setter
public class Portero extends Usuario {

    private String turno;

    protected Portero() {
        // Constructor sin argumentos para JPA.
    }

    public Portero(String nombreCompleto, String correo, String contrasenaHash,
                   String documento, String telefono, String turno) {
        super(nombreCompleto, correo, contrasenaHash, documento, telefono);
        this.turno = turno;
    }

    @Override
    public Rol getRol() {
        return Rol.PORTERO;
    }
}
