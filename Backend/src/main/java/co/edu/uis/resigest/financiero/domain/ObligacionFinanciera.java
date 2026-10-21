package co.edu.uis.resigest.financiero.domain;

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
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Deuda mensual de un apartamento (arriendo, cuota de administración o servicio).
 * El saldo se reduce con abonos hasta quedar PAGADA.
 */
@Entity
@Table(name = "obligacion_financiera")
@Getter
@Setter
public class ObligacionFinanciera extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "apartamento_id", nullable = false)
    private Apartamento apartamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConceptoCobro concepto;

    /** Periodo en formato "yyyy-MM". */
    @Column(nullable = false, length = 7)
    private String periodo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotal;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoPendiente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoObligacion estado;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    protected ObligacionFinanciera() {
        // Constructor sin argumentos para JPA.
    }

    public ObligacionFinanciera(Apartamento apartamento, ConceptoCobro concepto, String periodo,
                                BigDecimal montoTotal, LocalDate fechaVencimiento) {
        this.apartamento = apartamento;
        this.concepto = concepto;
        this.periodo = periodo;
        this.montoTotal = montoTotal;
        this.saldoPendiente = montoTotal;
        this.estado = EstadoObligacion.PENDIENTE;
        this.fechaVencimiento = fechaVencimiento;
    }

    /** Resta del saldo y, si llega a cero, pasa a PAGADA. Rechaza montos inválidos. */
    public void registrarAbono(BigDecimal monto) {
        if (monto == null || monto.signum() <= 0) {
            throw new ReglaNegocioException("El abono debe ser mayor que cero");
        }
        if (monto.compareTo(saldoPendiente) > 0) {
            throw new ReglaNegocioException("El abono supera el saldo pendiente");
        }
        saldoPendiente = saldoPendiente.subtract(monto);
        if (saldoPendiente.signum() == 0) {
            estado = EstadoObligacion.PAGADA;
        }
    }

    public void marcarEnVerificacion() {
        estado = EstadoObligacion.EN_VERIFICACION;
    }

    public void marcarVencida() {
        if (estado == EstadoObligacion.PENDIENTE) {
            estado = EstadoObligacion.VENCIDA;
        }
    }

    public boolean estaSaldada() {
        return estado == EstadoObligacion.PAGADA || saldoPendiente.signum() == 0;
    }

    public boolean estaVencida() {
        return estado == EstadoObligacion.PENDIENTE && fechaVencimiento.isBefore(LocalDate.now());
    }
}
