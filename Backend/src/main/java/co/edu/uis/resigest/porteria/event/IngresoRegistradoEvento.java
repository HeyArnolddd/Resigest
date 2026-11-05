package co.edu.uis.resigest.porteria.event;

import co.edu.uis.resigest.common.domain.EventoDominio;

/**
 * Portería registró el ingreso de alguien que va para un apartamento.
 */
public class IngresoRegistradoEvento extends EventoDominio {

    private final Long apartamentoId;
    private final String nombreVisitante;
    private final String tipo;

    public IngresoRegistradoEvento(Long apartamentoId, String nombreVisitante, String tipo) {
        this.apartamentoId = apartamentoId;
        this.nombreVisitante = nombreVisitante;
        this.tipo = tipo;
    }

    public Long getApartamentoId() {
        return apartamentoId;
    }

    public String getNombreVisitante() {
        return nombreVisitante;
    }

    public String getTipo() {
        return tipo;
    }

    @Override
    public String descripcion() {
        return nombreVisitante + " ingresó para el apartamento " + apartamentoId;
    }
}
