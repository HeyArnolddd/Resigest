package co.edu.uis.resigest.usuarios.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Administrador: gestión integral del edificio en la plataforma.
 */
@Entity
@Table(name = "administrador")
@Getter
@Setter
public class Administrador extends Usuario {

    protected Administrador() {
        // Constructor sin argumentos para JPA.
    }

    public Administrador(String nombreCompleto, String correo, String contrasenaHash,
                         String documento, String telefono) {
        super(nombreCompleto, correo, contrasenaHash, documento, telefono);
    }

    @Override
    public Rol getRol() {
        return Rol.ADMINISTRADOR;
    }
}
