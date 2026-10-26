package co.edu.uis.resigest.financiero.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Factura de un servicio público común que se reparte entre los apartamentos.
 */
@Entity
@Table(name = "factura_servicio_comun")
@Getter
@Setter
public class FacturaServicioComun extends EntidadBase {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoServicio tipo;

    @Column(nullable = false, length = 7)
    private String periodo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private LocalDate fechaEmision;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleProrrateo> detalles = new ArrayList<>();

    protected FacturaServicioComun() {
        // Constructor sin argumentos para JPA.
    }

    public FacturaServicioComun(TipoServicio tipo, String periodo, BigDecimal total) {
        this.tipo = tipo;
        this.periodo = periodo;
        this.total = total;
        this.fechaEmision = LocalDate.now();
    }
}
