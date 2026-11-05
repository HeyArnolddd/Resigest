package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.MensajeComunidad;
import co.edu.uis.resigest.usuarios.dto.DirectorioDTO;
import co.edu.uis.resigest.usuarios.mapper.UsuarioMapper;

import java.time.LocalDateTime;

/**
 * Mensaje del chat comunitario con el nombre del autor y su apartamento o cargo.
 */
public record MensajeComunidadDTO(
        Long id,
        Long autorId,
        String autorNombre,
        String detalle,
        String contenido,
        LocalDateTime fecha
) {
    public static MensajeComunidadDTO de(MensajeComunidad mensaje) {
        DirectorioDTO autor = UsuarioMapper.aDirectorio(mensaje.getAutor());
        return new MensajeComunidadDTO(mensaje.getId(), autor.id(), autor.nombreCompleto(), autor.detalle(),
                mensaje.getContenido(), mensaje.getFecha());
    }
}
