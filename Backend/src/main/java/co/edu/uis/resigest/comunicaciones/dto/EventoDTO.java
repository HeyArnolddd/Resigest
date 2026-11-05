package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.Evento;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventoDTO(
        Long id,
        String titulo,
        String descripcion,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        String lugar,
        String tipo
) {
    public static EventoDTO de(Evento evento) {
        return new EventoDTO(evento.getId(), evento.getTitulo(), evento.getDescripcion(), evento.getFecha(),
                evento.getHoraInicio(), evento.getHoraFin(), evento.getLugar(), evento.getTipo().name());
    }
}
