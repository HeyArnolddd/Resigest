package co.edu.uis.resigest.porteria.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
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
 * Paquete recibido en portería.
 */
@Entity
@Table(name = "paquete")
@Getter
@Setter
public class Paquete extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "apartamento_destino_id", nullable = false)
    private Apartamento apartamentoDestino;

    @Column(nullable = false, length = 100)
    private String empresaTransportadora;

    @Column(length = 500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPaquete estado;

    @Column(nullable = false)
    private LocalDateTime fechaRecepcion;

    private LocalDateTime fechaEntrega;

    @Column(length = 200)
    private String entregadoA;

    protected Paquete() {
        // Constructor sin argumentos para JPA.
    }

    public Paquete(Apartamento apartamentoDestino, String empresaTransportadora, String descripcion) {
        this.apartamentoDestino = apartamentoDestino;
        this.empresaTransportadora = empresaTransportadora;
        this.descripcion = descripcion;
        this.estado = EstadoPaquete.RECIBIDO;
        this.fechaRecepcion = LocalDateTime.now();
    }

    public void marcarNotificado() {
        if (estado != EstadoPaquete.RECIBIDO) {
            throw new ReglaNegocioException("Solo se puede notificar un paquete RECIBIDO");
        }
        estado = EstadoPaquete.NOTIFICADO;
    }

    public void entregarA(String nombreQuienRecibe) {
        if (estado == EstadoPaquete.ENTREGADO) {
            throw new ReglaNegocioException("El paquete ya fue entregado");
        }
        this.entregadoA = nombreQuienRecibe;
        this.fechaEntrega = LocalDateTime.now();
        this.estado = EstadoPaquete.ENTREGADO;
    }
}
