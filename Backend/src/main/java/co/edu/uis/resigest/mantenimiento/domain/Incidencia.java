package co.edu.uis.resigest.mantenimiento.domain;

import co.edu.uis.resigest.common.domain.EntidadBase;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Incidencia de mantenimiento reportada por un residente o portero.
 * Ciclo: ABIERTA → ASIGNADA → EN_PROCESO → RESUELTA.
 */
@Entity
@Table(name = "incidencia")
@Getter
@Setter
public class Incidencia extends EntidadBase {

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String descripcion;

    @Column(length = 200)
    private String ubicacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoIncidencia estado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrioridadIncidencia prioridad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reportado_por_id", nullable = false)
    private Usuario reportadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignado_a_id")
    private TecnicoMantenimiento asignadoA;

    @Column(length = 1000)
    private String solucion;

    @OneToMany(mappedBy = "incidencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EvidenciaIncidencia> evidencias = new ArrayList<>();

    protected Incidencia() {
        // Constructor sin argumentos para JPA.
    }

    public Incidencia(String titulo, String descripcion, String ubicacion,
                      PrioridadIncidencia prioridad, Usuario reportadoPor) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.ubicacion = ubicacion;
        this.prioridad = prioridad;
        this.reportadoPor = reportadoPor;
        this.estado = EstadoIncidencia.ABIERTA;
    }

    public void asignarA(TecnicoMantenimiento tecnico) {
        if (estado != EstadoIncidencia.ABIERTA) {
            throw new ReglaNegocioException("Solo se puede asignar una incidencia ABIERTA");
        }
        this.asignadoA = tecnico;
        this.estado = EstadoIncidencia.ASIGNADA;
    }

    public void iniciarTrabajo() {
        if (estado != EstadoIncidencia.ASIGNADA) {
            throw new ReglaNegocioException("Solo se puede iniciar una incidencia ASIGNADA");
        }
        this.estado = EstadoIncidencia.EN_PROCESO;
    }

    public void resolver(String solucion) {
        if (estado == EstadoIncidencia.RESUELTA) {
            throw new ReglaNegocioException("La incidencia ya está resuelta");
        }
        if (solucion == null || solucion.isBlank()) {
            throw new ReglaNegocioException("Debe registrar la solución aplicada");
        }
        this.solucion = solucion;
        this.estado = EstadoIncidencia.RESUELTA;
    }
}
