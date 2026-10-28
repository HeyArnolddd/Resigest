package co.edu.uis.resigest.usuarios.domain;

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

/**
 * Residente responsable de un apartamento (propietario o arrendatario).
 */
@Entity
@Table(name = "residente")
@Getter
@Setter
public class Residente extends Usuario {

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_residente", nullable = false)
    private TipoResidente tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "apartamento_id", nullable = false)
    private Apartamento apartamento;

    protected Residente() {
        // Constructor sin argumentos para JPA.
    }

    public Residente(String nombreCompleto, String correo, String contrasenaHash,
                     String documento, String telefono, TipoResidente tipo,
                     Apartamento apartamento) {
        super(nombreCompleto, correo, contrasenaHash, documento, telefono);
        this.tipo = tipo;
        this.apartamento = apartamento;
    }

    @Override
    public Rol getRol() {
        return Rol.RESIDENTE;
    }
}
