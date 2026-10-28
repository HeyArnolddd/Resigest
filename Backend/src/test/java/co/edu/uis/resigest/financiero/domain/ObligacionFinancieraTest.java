package co.edu.uis.resigest.financiero.domain;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ObligacionFinancieraTest {

    private ObligacionFinanciera crearObligacion() {
        Torre torre = new Torre("1", 5);
        Apartamento apartamento = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        return new ObligacionFinanciera(apartamento, ConceptoCobro.ARRIENDO, "2026-10",
                new BigDecimal("1000.00"), LocalDate.of(2026, 10, 10));
    }

    @Test
    void registrarAbonoSaldaYPasaAPagada() {
        ObligacionFinanciera obligacion = crearObligacion();

        obligacion.registrarAbono(new BigDecimal("1000.00"));

        assertThat(obligacion.estaSaldada()).isTrue();
        assertThat(obligacion.getEstado()).isEqualTo(EstadoObligacion.PAGADA);
    }

    @Test
    void registrarAbonoRechazaMontoMayorAlSaldo() {
        ObligacionFinanciera obligacion = crearObligacion();

        assertThatThrownBy(() -> obligacion.registrarAbono(new BigDecimal("2000.00")))
                .isInstanceOf(ReglaNegocioException.class);
    }
}
