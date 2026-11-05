package co.edu.uis.resigest.usuarios.dto;

import co.edu.uis.resigest.usuarios.domain.TipoResidente;

/**
 * Datos de residente que se incluyen en el perfil del usuario (solo rol RESIDENTE).
 */
public record ResidenteInfoDTO(
        TipoResidente tipo,
        Long apartamentoId,
        String apartamento
) {
}
