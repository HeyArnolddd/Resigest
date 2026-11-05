package co.edu.uis.resigest.comunicaciones.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Evento de la agenda del conjunto, publicado por la administración.
 */
@Entity
@Table(name = "evento")
@Getter
public class Evento extends EntidadBase {

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime horaInicio;

    private LocalTime horaFin;

    @Column(nullable = false, length = 150)
    private String lugar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoEvento tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creado_por_id", nullable = false)
    private Usuario creadoPor;

    protected Evento() {
        // Constructor sin argumentos para JPA.
    }

    public Evento(String titulo, String descripcion, LocalDate fecha, LocalTime horaInicio, LocalTime horaFin,
                  String lugar, TipoEvento tipo, Usuario creadoPor) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.lugar = lugar;
        this.tipo = tipo;
        this.creadoPor = creadoPor;
    }
}
