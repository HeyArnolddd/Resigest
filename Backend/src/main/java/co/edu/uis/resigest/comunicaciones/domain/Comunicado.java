package co.edu.uis.resigest.comunicaciones.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Comunicado oficial publicado por la administración.
 */
@Entity
@Table(name = "comunicado")
@Getter
@Setter
public class Comunicado extends EntidadBase {

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, length = 2000)
    private String cuerpo;

    @Column(length = 500)
    private String urlAdjunto;

    @Column(nullable = false)
    private boolean fijado = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Administrador autor;

    @Column(nullable = false)
    private LocalDateTime fechaPublicacion;

    protected Comunicado() {
        // Constructor sin argumentos para JPA.
    }

    public Comunicado(String titulo, String cuerpo, String urlAdjunto, Administrador autor) {
        this.titulo = titulo;
        this.cuerpo = cuerpo;
        this.urlAdjunto = urlAdjunto;
        this.autor = autor;
        this.fechaPublicacion = LocalDateTime.now();
    }

    public void fijar() {
        this.fijado = true;
    }

    public void desfijar() {
        this.fijado = false;
    }
}
