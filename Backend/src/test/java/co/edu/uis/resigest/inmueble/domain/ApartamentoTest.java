package co.edu.uis.resigest.inmueble.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ApartamentoTest {

    @Test
    void identificadorCompletoCombinaTorreYNumero() {
        Torre torre = new Torre("2", 10);
        Apartamento apartamento = new Apartamento("304", 3, new BigDecimal("12.3456"), torre);

        assertThat(apartamento.identificadorCompleto()).isEqualTo("Torre 2 – Apto 304");
    }
}
