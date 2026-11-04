package co.edu.uis.resigest.usuarios.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
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
 * Token de un solo uso para restablecer la contraseña.
 */
@Entity
@Table(name = "token_recuperacion")
@Getter
@Setter
public class TokenRecuperacion extends EntidadBase {

    @Column(nullable = false, unique = true, length = 64)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime expiracion;

    @Column(nullable = false)
    private boolean usado = false;

    protected TokenRecuperacion() {
        // Constructor sin argumentos para JPA.
    }

    public TokenRecuperacion(String token, Usuario usuario, LocalDateTime expiracion) {
        this.token = token;
        this.usuario = usuario;
        this.expiracion = expiracion;
    }

    public boolean esValido() {
        return !usado && expiracion.isAfter(LocalDateTime.now());
    }

    public void marcarUsado() {
        this.usado = true;
    }
}
