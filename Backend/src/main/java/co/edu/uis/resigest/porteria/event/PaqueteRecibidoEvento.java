package co.edu.uis.resigest.porteria.event;

import co.edu.uis.resigest.common.domain.EventoDominio;

/**
 * Portería recibió un paquete para un apartamento.
 */
public class PaqueteRecibidoEvento extends EventoDominio {

    private final Long apartamentoId;
    private final String empresaTransportadora;

    public PaqueteRecibidoEvento(Long apartamentoId, String empresaTransportadora) {
        this.apartamentoId = apartamentoId;
        this.empresaTransportadora = empresaTransportadora;
    }

    public Long getApartamentoId() {
        return apartamentoId;
    }

    public String getEmpresaTransportadora() {
        return empresaTransportadora;
    }

    @Override
    public String descripcion() {
        return "Se recibió un paquete para el apartamento " + apartamentoId;
    }
}
