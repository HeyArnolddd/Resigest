package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.Evento;

import java.time.LocalDateTime;

public record EventoDTO(Long id, String titulo, String descripcion, LocalDateTime fecha, String lugar, String tipo) {

    public static EventoDTO de(Evento e) {
        return new EventoDTO(e.getId(), e.getTitulo(), e.getDescripcion(), e.getFecha(), e.getLugar(), e.getTipo());
    }
}
