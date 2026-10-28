package co.edu.uis.resigest.porteria.domain;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PaqueteTest {

    private Paquete crearPaquete() {
        Torre torre = new Torre("1", 5);
        Apartamento apartamento = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        return new Paquete(apartamento, "Servientrega", "Caja");
    }

    @Test
    void entregarAPasaAEntregado() {
        Paquete paquete = crearPaquete();
        paquete.entregarA("Arnold");
        assertThat(paquete.getEstado()).isEqualTo(EstadoPaquete.ENTREGADO);
        assertThat(paquete.getEntregadoA()).isEqualTo("Arnold");
    }

    @Test
    void entregarDosVecesLanzaExcepcion() {
        Paquete paquete = crearPaquete();
        paquete.entregarA("Arnold");
        assertThatThrownBy(() -> paquete.entregarA("Otro")).isInstanceOf(ReglaNegocioException.class);
    }
}
