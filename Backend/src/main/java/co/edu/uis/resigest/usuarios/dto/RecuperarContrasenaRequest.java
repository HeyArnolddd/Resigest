package co.edu.uis.resigest.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RecuperarContrasenaRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Correo inválido")
        String correo
) {
}
