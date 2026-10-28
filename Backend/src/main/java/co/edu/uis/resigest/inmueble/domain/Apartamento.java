package co.edu.uis.resigest.inmueble.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * Apartamento de una torre: unidad habitacional con coeficiente de copropiedad.
 */
@Entity
@Table(name = "apartamento")
public class Apartamento extends EntidadBase {

    @Column(nullable = false, length = 20)
    private String numero;

    @Column(nullable = false)
    private int piso;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal coeficienteCopropiedad;

    @Column(nullable = false)
    private boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "torre_id", nullable = false)
    private Torre torre;

    protected Apartamento() {
        // Constructor sin argumentos para JPA.
    }

    public Apartamento(String numero, int piso, BigDecimal coeficienteCopropiedad, Torre torre) {
        this.numero = numero;
        this.piso = piso;
        this.coeficienteCopropiedad = coeficienteCopropiedad;
        this.torre = torre;
    }

    /**
     * Ejemplo de salida: "Torre 2 – Apto 304".
     */
    public String identificadorCompleto() {
        return "Torre " + torre.getNombre() + " – Apto " + numero;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public int getPiso() {
        return piso;
    }

    public void setPiso(int piso) {
        this.piso = piso;
    }

    public BigDecimal getCoeficienteCopropiedad() {
        return coeficienteCopropiedad;
    }

    public void setCoeficienteCopropiedad(BigDecimal coeficienteCopropiedad) {
        this.coeficienteCopropiedad = coeficienteCopropiedad;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Torre getTorre() {
        return torre;
    }

    public void setTorre(Torre torre) {
        this.torre = torre;
    }
}
