package co.edu.uis.resigest.usuarios.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Usuario base del sistema. Estrategia JOINED: lo común va en la tabla
 * {@code usuario} y cada subclase aporta su propia tabla.
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "usuario")
@Getter
@Setter
public abstract class Usuario extends EntidadBase {

    @Column(nullable = false)
    private String nombreCompleto;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(nullable = false)
    private String contrasenaHash;

    @Column(nullable = false)
    private String documento;

    private String telefono;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(nullable = false)
    private int intentosFallidos = 0;

    private LocalDateTime bloqueadoHasta;

    protected Usuario() {}

    public Usuario(String nombreCompleto, String correo, String contrasenaHash,
                   String documento, String telefono) {
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.contrasenaHash = contrasenaHash;
        this.documento = documento;
        this.telefono = telefono;
    }

    public abstract Rol getRol();

    /** RF01: la cuenta queda bloqueada por 15 minutos tras 5 intentos fallidos. */
    public void registrarIntentoFallido() {
        intentosFallidos++;
        if (intentosFallidos >= 5) {
            bloqueadoHasta = LocalDateTime.now().plusMinutes(15);
            intentosFallidos = 0;
        }
    }

    public boolean estaBloqueado() {
        return bloqueadoHasta != null && bloqueadoHasta.isAfter(LocalDateTime.now());
    }

    public void reiniciarIntentos() {
        intentosFallidos = 0;
        bloqueadoHasta = null;
    }

    public void activar() {
        activo = true;
    }

    public void desactivar() {
        activo = false;
    }
}
