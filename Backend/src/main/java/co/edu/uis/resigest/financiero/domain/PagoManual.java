package co.edu.uis.resigest.financiero.domain;

import co.edu.uis.resigest.usuarios.domain.Administrador;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Pago reportado por transferencia manual: requiere validación del administrador.
 */
@Entity
@DiscriminatorValue("TRANSFERENCIA")
@Getter
@Setter
public class PagoManual extends Pago {

    private String urlComprobanteAdjunto;

    private String observacionAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validado_por_id")
    private Administrador validadoPor;

    protected PagoManual() {
        // Constructor sin argumentos para JPA.
    }

    public PagoManual(BigDecimal monto, ObligacionFinanciera obligacion, String urlComprobanteAdjunto) {
        super(monto, obligacion);
        this.urlComprobanteAdjunto = urlComprobanteAdjunto;
        setEstado(EstadoPago.EN_VERIFICACION);
    }

    @Override
    public MetodoPago getMetodo() {
        return MetodoPago.TRANSFERENCIA;
    }

    @Override
    public boolean requiereValidacionManual() {
        return true;
    }
}
