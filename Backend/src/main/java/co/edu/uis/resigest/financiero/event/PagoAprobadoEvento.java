package co.edu.uis.resigest.financiero.event;

import co.edu.uis.resigest.common.domain.EventoDominio;

import java.math.BigDecimal;

/**
 * Se publica cuando un pago queda aprobado.
 */
public class PagoAprobadoEvento extends EventoDominio {

    private final Long apartamentoId;
    private final BigDecimal monto;

    public PagoAprobadoEvento(Long apartamentoId, BigDecimal monto) {
        this.apartamentoId = apartamentoId;
        this.monto = monto;
    }

    public Long getApartamentoId() {
        return apartamentoId;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    @Override
    public String descripcion() {
        return "Pago aprobado por " + monto;
    }
}
