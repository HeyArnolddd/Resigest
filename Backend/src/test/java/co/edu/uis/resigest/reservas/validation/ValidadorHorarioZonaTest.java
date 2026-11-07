package co.edu.uis.resigest.reservas.validation;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ValidadorHorarioZonaTest {

    private final ValidadorHorarioZona validador = new ValidadorHorarioZona();
    private final ZonaComun bbq = new ZonaComun("BBQ", "Zona de parrilla", 10,
            LocalTime.of(10, 0), LocalTime.of(22, 0));

    private static SolicitudReservaRequest reserva(LocalDateTime inicio, LocalDateTime fin) {
        return new SolicitudReservaRequest(1L, inicio, fin);
    }

    @Test
    void aceptaReservaDentroDelHorario() {
        assertThatCode(() -> validador.validar(reserva(
                LocalDateTime.of(2027, 1, 10, 18, 0), LocalDateTime.of(2027, 1, 10, 22, 0)), null, bbq))
                .doesNotThrowAnyException();
    }

    @Test
    void rechazaReservaAntesDeLaApertura() {
        assertThatThrownBy(() -> validador.validar(reserva(
                LocalDateTime.of(2027, 1, 10, 8, 0), LocalDateTime.of(2027, 1, 10, 11, 0)), null, bbq))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("entre las 10:00 y las 22:00");
    }

    @Test
    void rechazaReservaQueTerminaDespuesDelCierre() {
        assertThatThrownBy(() -> validador.validar(reserva(
                LocalDateTime.of(2027, 1, 10, 20, 0), LocalDateTime.of(2027, 1, 10, 23, 0)), null, bbq))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void rechazaReservaQuePasaALaMadrugadaSiguiente() {
        assertThatThrownBy(() -> validador.validar(reserva(
                LocalDateTime.of(2027, 1, 10, 21, 0), LocalDateTime.of(2027, 1, 11, 1, 0)), null, bbq))
                .isInstanceOf(ReglaNegocioException.class);
    }
}
