package co.edu.uis.resigest.porteria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistrarPaqueteRequest(
        @NotNull(message = "El apartamento de destino es obligatorio")
        Long apartamentoDestinoId,

        @NotBlank(message = "La empresa transportadora es obligatoria")
        @Size(max = 100, message = "La empresa no puede superar 100 caracteres")
        String empresaTransportadora,

        @Size(max = 500, message = "La descripción no puede superar 500 caracteres")
        String descripcion,

        @Size(max = 50, message = "La guía no puede superar 50 caracteres")
        String guia,

        @Size(max = 20, message = "El tamaño no puede superar 20 caracteres")
        String tamano
) {
}
