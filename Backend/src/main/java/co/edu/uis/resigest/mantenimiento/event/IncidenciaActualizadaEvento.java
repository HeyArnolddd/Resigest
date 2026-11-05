package co.edu.uis.resigest.mantenimiento.event;

import co.edu.uis.resigest.common.domain.EventoDominio;

/**
 * Una incidencia cambió de manos o de estado: se asignó a un técnico o se resolvió.
 * {@code destinatarioId} es a quién hay que avisarle (el técnico o quien la reportó).
 */
public class IncidenciaActualizadaEvento extends EventoDominio {

    public enum Tipo { ASIGNADA, RESUELTA }

    private final Tipo tipo;
    private final Long destinatarioId;
    private final String titulo;

    public IncidenciaActualizadaEvento(Tipo tipo, Long destinatarioId, String titulo) {
        this.tipo = tipo;
        this.destinatarioId = destinatarioId;
        this.titulo = titulo;
    }

    public Tipo getTipo() {
        return tipo;
    }

    public Long getDestinatarioId() {
        return destinatarioId;
    }

    public String getTitulo() {
        return titulo;
    }

    @Override
    public String descripcion() {
        return "La incidencia \"" + titulo + "\" quedó " + (tipo == Tipo.ASIGNADA ? "asignada" : "resuelta");
    }
}
