package co.edu.uis.resigest.mantenimiento.domain;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IncidenciaTest {

    private Incidencia crearIncidencia() {
        Usuario reportador = new Administrador("Admin", "admin@x.com", "hash", "doc", null);
        return new Incidencia("Fuga", "Hay una fuga", "Baño", PrioridadIncidencia.ALTA, reportador);
    }

    @Test
    void asignarAPasaAAAsignada() {
        Incidencia incidencia = crearIncidencia();
        TecnicoMantenimiento tecnico = new TecnicoMantenimiento(
                "Tec", "tec@x.com", "hash", "doc", null, "plomeria");

        incidencia.asignarA(tecnico);

        assertThat(incidencia.getEstado()).isEqualTo(EstadoIncidencia.ASIGNADA);
        assertThat(incidencia.getAsignadoA()).isEqualTo(tecnico);
    }

    @Test
    void resolverSinSolucionLanzaExcepcion() {
        Incidencia incidencia = crearIncidencia();
        assertThatThrownBy(() -> incidencia.resolver(" ", "/api/archivos/1"))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void resolverSinFotoLanzaExcepcion() {
        Incidencia incidencia = crearIncidencia();
        assertThatThrownBy(() -> incidencia.resolver("Se cambió el empaque", null))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("foto");
    }

    @Test
    void confirmarSolucionCierraLaIncidencia() {
        Incidencia incidencia = crearIncidencia();
        incidencia.resolver("Se cambió el empaque", "/api/archivos/1");

        incidencia.confirmarSolucion();

        assertThat(incidencia.getEstado()).isEqualTo(EstadoIncidencia.CERRADA);
    }

    @Test
    void reabrirVuelveAEnProcesoConElComentario() {
        Incidencia incidencia = crearIncidencia();
        incidencia.resolver("Se cambió el empaque", "/api/archivos/1");

        incidencia.reabrir("Sigue goteando de noche");

        assertThat(incidencia.getEstado()).isEqualTo(EstadoIncidencia.EN_PROCESO);
        assertThat(incidencia.getObservacionConfirmacion()).isEqualTo("Sigue goteando de noche");
    }

    @Test
    void noSePuedeConfirmarLoQueNoEstaResuelto() {
        Incidencia incidencia = crearIncidencia();
        assertThatThrownBy(incidencia::confirmarSolucion).isInstanceOf(ReglaNegocioException.class);
        assertThatThrownBy(() -> incidencia.reabrir("No")).isInstanceOf(ReglaNegocioException.class);
    }
}
