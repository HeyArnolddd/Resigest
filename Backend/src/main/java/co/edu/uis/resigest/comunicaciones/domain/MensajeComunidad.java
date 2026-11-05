package co.edu.uis.resigest.comunicaciones.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Mensaje del chat de todo el conjunto (un único grupo).
 */
@Entity
@Table(name = "mensaje_comunidad")
@Getter
public class MensajeComunidad extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(nullable = false, length = 1000)
    private String contenido;

    @Column(nullable = false)
    private LocalDateTime fecha;

    protected MensajeComunidad() {
        // Constructor sin argumentos para JPA.
    }

    public MensajeComunidad(Usuario autor, String contenido) {
        this.autor = autor;
        this.contenido = contenido;
        this.fecha = LocalDateTime.now();
    }
}
