package co.edu.uis.resigest.common.archivos;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;

/**
 * Archivo subido por un usuario (foto de una incidencia o de un paquete, comprobante de pago).
 * Se guarda en la base de datos para que no se pierda al volver a desplegar el backend.
 */
@Entity
@Table(name = "archivo")
@Getter
public class Archivo extends EntidadBase {

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String tipoContenido;

    @Column(nullable = false)
    private long tamano;

    @Column(nullable = false)
    private byte[] datos;

    @Column(name = "subido_por_id")
    private Long subidoPorId;

    protected Archivo() {
        // Constructor sin argumentos para JPA.
    }

    public Archivo(String nombre, String tipoContenido, byte[] datos, Long subidoPorId) {
        this.nombre = nombre;
        this.tipoContenido = tipoContenido;
        this.datos = datos;
        this.tamano = datos.length;
        this.subidoPorId = subidoPorId;
    }
}
