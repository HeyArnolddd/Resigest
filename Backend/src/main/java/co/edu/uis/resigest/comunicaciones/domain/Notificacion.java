package co.edu.uis.resigest.comunicaciones.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.usuarios.domain.Usuario;
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
 * Notificación dirigida a un usuario.
 */
@Entity
@Table(name = "notificacion")
@Getter
@Setter
public class Notificacion extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoNotificacion tipo;

    @Column(nullable = false)
    private boolean leida = false;

    @Column(nullable = false)
    private LocalDateTime fechaEnvio;

    @Column(length = 200)
    private String referencia;

    protected Notificacion() {
        // Constructor sin argumentos para JPA.
    }

    public Notificacion(Usuario destinatario, String titulo, String mensaje,
                        TipoNotificacion tipo, String referencia) {
        this.destinatario = destinatario;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.referencia = referencia;
        this.fechaEnvio = LocalDateTime.now();
    }

    public void marcarLeida() {
        this.leida = true;
    }
}
