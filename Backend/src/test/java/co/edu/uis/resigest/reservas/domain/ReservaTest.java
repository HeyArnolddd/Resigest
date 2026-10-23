package co.edu.uis.resigest.reservas.domain;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ReservaTest {

    private Reserva crearReserva() {
        ZonaComun zona = new ZonaComun("BBQ", "Zona de BBQ", 10);
        Torre torre = new Torre("1", 5);
        Apartamento apartamento = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        return new Reserva(zona, apartamento,
                LocalDateTime.of(2026, 10, 10, 14, 0),
                LocalDateTime.of(2026, 10, 10, 18, 0));
    }

    @Test
    void seSolapaConRangoQueSeCruza() {
        Reserva reserva = crearReserva();
        assertThat(reserva.seSolapaCon(
                LocalDateTime.of(2026, 10, 10, 16, 0),
                LocalDateTime.of(2026, 10, 10, 20, 0))).isTrue();
    }

    @Test
    void noSeSolapaConRangoAnterior() {
        Reserva reserva = crearReserva();
        assertThat(reserva.seSolapaCon(
                LocalDateTime.of(2026, 10, 10, 10, 0),
                LocalDateTime.of(2026, 10, 10, 13, 0))).isFalse();
    }

    @Test
    void aprobarPasaPendienteAAprobada() {
        Reserva reserva = crearReserva();
        reserva.aprobar();
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.APROBADA);
    }

    @Test
    void aprobarDosVecesLanzaExcepcion() {
        Reserva reserva = crearReserva();
        reserva.aprobar();
        assertThatThrownBy(reserva::aprobar).isInstanceOf(ReglaNegocioException.class);
    }
}
