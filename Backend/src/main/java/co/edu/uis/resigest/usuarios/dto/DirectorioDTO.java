package co.edu.uis.resigest.usuarios.dto;

import co.edu.uis.resigest.usuarios.domain.Rol;

/**
 * Entrada del directorio del conjunto, visible para cualquier usuario autenticado.
 * Solo datos de contacto públicos: el teléfono se muestra para el personal y la
 * administración, nunca el de los residentes. {@code detalle} es el apartamento,
 * el turno o la especialidad según el rol.
 */
public record DirectorioDTO(
        Long id,
        String nombreCompleto,
        Rol rol,
        String detalle,
        String telefono
) {
}
