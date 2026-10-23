package co.edu.uis.resigest.mantenimiento.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Archivo adjunto (foto) asociado a una incidencia.
 */
@Entity
@Table(name = "evidencia_incidencia")
@Getter
@Setter
public class EvidenciaIncidencia extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incidencia_id", nullable = false)
    private Incidencia incidencia;

    @Column(nullable = false, length = 500)
    private String urlArchivo;

    @Column(nullable = false, length = 255)
    private String nombreArchivo;

    protected EvidenciaIncidencia() {
        // Constructor sin argumentos para JPA.
    }

    public EvidenciaIncidencia(Incidencia incidencia, String urlArchivo, String nombreArchivo) {
        this.incidencia = incidencia;
        this.urlArchivo = urlArchivo;
        this.nombreArchivo = nombreArchivo;
    }
}
