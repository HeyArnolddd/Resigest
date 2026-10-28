package co.edu.uis.resigest.financiero.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Valor prorrateado que le corresponde a un apartamento por una factura común.
 */
@Entity
@Table(name = "detalle_prorrateo")
@Getter
@Setter
public class DetalleProrrateo extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "factura_id", nullable = false)
    private FacturaServicioComun factura;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "apartamento_id", nullable = false)
    private Apartamento apartamento;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    protected DetalleProrrateo() {
        // Constructor sin argumentos para JPA.
    }

    public DetalleProrrateo(FacturaServicioComun factura, Apartamento apartamento, BigDecimal valor) {
        this.factura = factura;
        this.apartamento = apartamento;
        this.valor = valor;
    }
}
