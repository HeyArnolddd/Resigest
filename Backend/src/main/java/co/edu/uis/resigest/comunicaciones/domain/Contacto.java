package co.edu.uis.resigest.comunicaciones.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Contacto del directorio del conjunto (portería, administración, emergencias). */
@Entity
@Table(name = "contacto")
@Getter
@Setter
public class Contacto extends EntidadBase {

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 200)
    private String detalle;

    @Column(nullable = false, length = 40)
    private String telefono;

    @Column(nullable = false, length = 30)
    private String categoria = "CONJUNTO";

    protected Contacto() {
        // Constructor sin argumentos para JPA.
    }
}
