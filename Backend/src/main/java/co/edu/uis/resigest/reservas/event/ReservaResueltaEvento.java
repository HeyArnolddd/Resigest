package co.edu.uis.resigest.reservas.event;

import co.edu.uis.resigest.common.domain.EventoDominio;

/**
 * Se publica cuando una reserva es aprobada o rechazada.
 * Lleva datos planos para que el listener pueda trabajar tras el commit.
 */
public class ReservaResueltaEvento extends EventoDominio {

    private final Long apartamentoId;
    private final String zonaNombre;
    private final boolean aprobada;

    public ReservaResueltaEvento(Long apartamentoId, String zonaNombre, boolean aprobada) {
        this.apartamentoId = apartamentoId;
        this.zonaNombre = zonaNombre;
        this.aprobada = aprobada;
    }

    public Long getApartamentoId() {
        return apartamentoId;
    }

    public String getZonaNombre() {
        return zonaNombre;
    }

    public boolean isAprobada() {
        return aprobada;
    }

    @Override
    public String descripcion() {
        return "Reserva de " + zonaNombre + " " + (aprobada ? "aprobada" : "rechazada");
    }
}
