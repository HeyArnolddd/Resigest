package co.edu.uis.resigest.usuarios.dto;

import co.edu.uis.resigest.usuarios.domain.TipoResidente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Datos editables de un usuario. El rol no cambia: para eso se crea otra cuenta.
 * Igual que al registrar, cada rol usa solo los campos que le corresponden.
 */
public record ActualizarUsuarioRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombreCompleto,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Correo inválido")
        String correo,

        @NotBlank(message = "El documento es obligatorio")
        String documento,

        String telefono,

        TipoResidente tipoResidente,

        Long apartamentoId,

        String turno,

        String especialidad
) {
}
