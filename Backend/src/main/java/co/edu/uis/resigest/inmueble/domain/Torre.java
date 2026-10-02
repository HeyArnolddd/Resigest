package co.edu.uis.resigest.inmueble.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/**
 * Torre del edificio: agrupa los apartamentos de una misma estructura.
 */
@Entity
@Table(name = "torre")
public class Torre extends EntidadBase {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private int numeroPisos;

    @OneToMany(mappedBy = "torre")
    private List<Apartamento> apartamentos = new ArrayList<>();

    protected Torre() {
        // Constructor sin argumentos para JPA.
    }

    public Torre(String nombre, int numeroPisos) {
        this.nombre = nombre;
        this.numeroPisos = numeroPisos;
    }

    public int totalApartamentos() {
        return apartamentos.size();
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getNumeroPisos() {
        return numeroPisos;
    }

    public void setNumeroPisos(int numeroPisos) {
        this.numeroPisos = numeroPisos;
    }

    public List<Apartamento> getApartamentos() {
        return apartamentos;
    }
}
