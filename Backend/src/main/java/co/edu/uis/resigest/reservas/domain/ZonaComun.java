package co.edu.uis.resigest.reservas.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

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

    /** Horario de uso: toda reserva debe empezar y terminar el mismo día dentro de él. */
    @Column(name = "hora_apertura", nullable = false)
    private LocalTime horaApertura = LocalTime.of(8, 0);

    @Column(name = "hora_cierre", nullable = false)
    private LocalTime horaCierre = LocalTime.of(20, 0);

    protected ZonaComun() {
        // Constructor sin argumentos para JPA.
    }

    public ZonaComun(String nombre, String descripcion, int capacidad) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.capacidad = capacidad;
    }

    public ZonaComun(String nombre, String descripcion, int capacidad,
                     LocalTime horaApertura, LocalTime horaCierre) {
        this(nombre, descripcion, capacidad);
        this.horaApertura = horaApertura;
        this.horaCierre = horaCierre;
    }

    /** true si el rango cae en un mismo día y dentro del horario de la zona. */
    public boolean dentroDelHorario(LocalDateTime inicio, LocalDateTime fin) {
        return inicio.toLocalDate().equals(fin.toLocalDate())
                && !inicio.toLocalTime().isBefore(horaApertura)
                && !fin.toLocalTime().isAfter(horaCierre);
    }
}
