package co.edu.uis.resigest.reservas.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Zona común del edificio que se puede reservar (salón social, BBQ, cancha...).
 */
@Entity
@Table(name = "zona_comun")
@Getter
@Setter
public class ZonaComun extends EntidadBase {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    private int capacidad;

    @Column(nullable = false)
    private boolean activa = true;

    protected ZonaComun() {
        // Constructor sin argumentos para JPA.
    }

    public ZonaComun(String nombre, String descripcion, int capacidad) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.capacidad = capacidad;
    }
}
