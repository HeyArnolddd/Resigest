package co.edu.uis.resigest.financiero.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Pago procesado a través de la pasarela (Wompi). No requiere validación manual.
 */
@Entity
@DiscriminatorValue("WOMPI")
@Getter
@Setter
public class PagoPasarela extends Pago {

    private String idTransaccionExterna;

    private String urlRecibo;

    protected PagoPasarela() {
        // Constructor sin argumentos para JPA.
    }

    public PagoPasarela(BigDecimal monto, ObligacionFinanciera obligacion) {
        super(monto, obligacion);
    }

    @Override
    public MetodoPago getMetodo() {
        return MetodoPago.WOMPI;
    }

    @Override
    public boolean requiereValidacionManual() {
        return false;
    }
}
