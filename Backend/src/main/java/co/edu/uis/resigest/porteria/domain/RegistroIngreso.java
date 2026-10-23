package co.edu.uis.resigest.porteria.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.usuarios.domain.Portero;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Registro de ingreso en portería. La bitácora es inmutable: no se expone
 * edición ni borrado, solo registrar salida.
 */
@Entity
@Table(name = "registro_ingreso")
@Getter
@Setter
public class RegistroIngreso extends EntidadBase {

    @Column(nullable = false, length = 200)
    private String nombreVisitante;

    @Column(length = 50)
    private String documento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoIngreso tipo;

    @Column(length = 100)
    private String empresa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "apartamento_destino_id", nullable = false)
    private Apartamento apartamentoDestino;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrado_por_id", nullable = false)
    private Portero registradoPor;

    @Column(nullable = false)
    private LocalDateTime fechaIngreso;

    private LocalDateTime fechaSalida;

    protected RegistroIngreso() {
        // Constructor sin argumentos para JPA.
    }

    public RegistroIngreso(String nombreVisitante, String documento, TipoIngreso tipo, String empresa,
                           Apartamento apartamentoDestino, Portero registradoPor) {
        this.nombreVisitante = nombreVisitante;
        this.documento = documento;
        this.tipo = tipo;
        this.empresa = empresa;
        this.apartamentoDestino = apartamentoDestino;
        this.registradoPor = registradoPor;
        this.fechaIngreso = LocalDateTime.now();
    }

    public void registrarSalida() {
        if (fechaSalida != null) {
            throw new ReglaNegocioException("La salida ya fue registrada");
        }
        this.fechaSalida = LocalDateTime.now();
    }

    public boolean estaDentro() {
        return fechaSalida == null;
    }
}
