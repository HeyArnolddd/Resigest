package co.edu.uis.resigest.financiero.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Pago aplicado a una obligación. Estrategia SINGLE_TABLE: todos los pagos viven
 * en una sola tabla y se distinguen por la columna {@code metodo}.
 */
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "metodo")
@Table(name = "pago")
@Getter
@Setter
public abstract class Pago extends EntidadBase {

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPago estado;

    @Column(length = 100)
    private String referencia;

    @Column(length = 255)
    private String motivoRechazo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "obligacion_id", nullable = false)
    private ObligacionFinanciera obligacion;

    protected Pago() {
        // Constructor sin argumentos para JPA.
    }

    public Pago(BigDecimal monto, ObligacionFinanciera obligacion) {
        this.monto = monto;
        this.obligacion = obligacion;
        this.fecha = LocalDateTime.now();
        this.estado = EstadoPago.INICIADO;
    }

    public abstract MetodoPago getMetodo();

    public abstract boolean requiereValidacionManual();

    /** Solo se puede aprobar un pago INICIADO o EN_VERIFICACION. */
    public void aprobar() {
        if (estado != EstadoPago.INICIADO && estado != EstadoPago.EN_VERIFICACION) {
            throw new ReglaNegocioException("Solo se puede aprobar un pago INICIADO o EN_VERIFICACION");
        }
        estado = EstadoPago.APROBADO;
    }

    public void rechazar(String motivo) {
        if (estado != EstadoPago.INICIADO && estado != EstadoPago.EN_VERIFICACION) {
            throw new ReglaNegocioException("Solo se puede rechazar un pago INICIADO o EN_VERIFICACION");
        }
        estado = EstadoPago.RECHAZADO;
        this.motivoRechazo = motivo;
    }
}
