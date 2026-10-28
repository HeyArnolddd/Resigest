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
        assertThatThrownBy(() -> incidencia.resolver(" "))
                .isInstanceOf(ReglaNegocioException.class);
    }
}
