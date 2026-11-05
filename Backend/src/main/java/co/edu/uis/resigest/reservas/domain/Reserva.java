package co.edu.uis.resigest.reservas.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Reserva de una zona común en un bloque de tiempo. Usa bloqueo optimista
 * ({@code @Version}) para evitar dobles reservas simultáneas.
 */
@Entity
@Table(name = "reserva")
@Getter
@Setter
public class Reserva extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "zona_comun_id", nullable = false)
    private ZonaComun zonaComun;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "apartamento_id", nullable = false)
    private Apartamento apartamento;

    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    @Column(nullable = false)
    private LocalDateTime fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoReserva estado;

    @Version
    private Long version;

    protected Reserva() {
        // Constructor sin argumentos para JPA.
    }

    public Reserva(ZonaComun zonaComun, Apartamento apartamento,
                   LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        this.zonaComun = zonaComun;
        this.apartamento = apartamento;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = EstadoReserva.PENDIENTE;
    }

    /** Verdadero si este bloque [fechaInicio, fechaFin) se cruza con [inicio, fin). */
    public boolean seSolapaCon(LocalDateTime inicio, LocalDateTime fin) {
        return fechaInicio.isBefore(fin) && inicio.isBefore(fechaFin);
    }

    public void aprobar() {
        if (estado != EstadoReserva.PENDIENTE) {
            throw new ReglaNegocioException("Solo se puede aprobar una reserva PENDIENTE");
        }
        estado = EstadoReserva.APROBADA;
    }

    public void rechazar() {
        if (estado != EstadoReserva.PENDIENTE) {
            throw new ReglaNegocioException("Solo se puede rechazar una reserva PENDIENTE");
        }
        estado = EstadoReserva.RECHAZADA;
    }

    public void cancelar() {
        if (estado == EstadoReserva.APROBADA || estado == EstadoReserva.RECHAZADA) {
            throw new ReglaNegocioException("No se puede cancelar una reserva en estado " + estado);
        }
        estado = EstadoReserva.CANCELADA;
    }
}
