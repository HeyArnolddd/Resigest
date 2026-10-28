package co.edu.uis.resigest.porteria.domain;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import co.edu.uis.resigest.usuarios.domain.Portero;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RegistroIngresoTest {

    private RegistroIngreso crearRegistro() {
        Torre torre = new Torre("1", 5);
        Apartamento apartamento = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        Portero portero = new Portero("Portero", "portero@x.com", "hash", "doc", null, "mañana");
        return new RegistroIngreso("Juan", "123", TipoIngreso.VISITANTE, null, apartamento, portero);
    }

    @Test
    void registrarSalidaPoneFecha() {
        RegistroIngreso registro = crearRegistro();
        registro.registrarSalida();
        assertThat(registro.estaDentro()).isFalse();
    }

    @Test
    void registrarSalidaDosVecesLanzaExcepcion() {
        RegistroIngreso registro = crearRegistro();
        registro.registrarSalida();
        assertThatThrownBy(registro::registrarSalida).isInstanceOf(ReglaNegocioException.class);
    }
}
