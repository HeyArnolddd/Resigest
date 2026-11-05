package co.edu.uis.resigest.comunicaciones.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** Evento de la agenda del conjunto. */
@Entity
@Table(name = "evento")
@Getter
@Setter
public class Evento extends EntidadBase {

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(length = 200)
    private String lugar;

    @Column(nullable = false, length = 30)
    private String tipo = "GENERAL";

    protected Evento() {
        // Constructor sin argumentos para JPA.
    }

    public Evento(String titulo, String descripcion, LocalDateTime fecha, String lugar, String tipo) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.lugar = lugar;
        if (tipo != null && !tipo.isBlank()) {
            this.tipo = tipo.trim().toUpperCase();
        }
    }
}
