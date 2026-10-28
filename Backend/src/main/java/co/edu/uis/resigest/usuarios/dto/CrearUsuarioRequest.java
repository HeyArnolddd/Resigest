package co.edu.uis.resigest.usuarios.dto;

import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.TipoResidente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Datos para registrar un usuario. Según el rol se usan unos campos u otros
 * (por ejemplo, el residente requiere tipoResidente y apartamentoId).
 */
public record CrearUsuarioRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombreCompleto,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Correo inválido")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
        String contrasena,

        @NotBlank(message = "El documento es obligatorio")
        String documento,

        String telefono,

        @NotNull(message = "El rol es obligatorio")
        Rol rol,

        TipoResidente tipoResidente,

        Long apartamentoId,

        String turno,

        String especialidad
) {
}
