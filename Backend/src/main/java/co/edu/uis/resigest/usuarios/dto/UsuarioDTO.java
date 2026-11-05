package co.edu.uis.resigest.usuarios.dto;

import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.TipoResidente;

import java.time.LocalDateTime;

/**
 * DTO de salida de un usuario. Nunca incluye el hash de la contraseña.
 * Los campos de rol vienen en null cuando no aplican: tipoResidente,
 * apartamentoId y apartamento (residente), turno (portero) y especialidad
 * (mantenimiento).
 */
public record UsuarioDTO(
        Long id,
        String nombreCompleto,
        String correo,
        String documento,
        String telefono,
        boolean activo,
        Rol rol,
        TipoResidente tipoResidente,
        Long apartamentoId,
        String apartamento,
        String turno,
        String especialidad,
        LocalDateTime fechaCreacion
) {
}
