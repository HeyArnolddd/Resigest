package co.edu.uis.resigest.inmueble.dto;

import co.edu.uis.resigest.inmueble.domain.Apartamento;

import java.math.BigDecimal;

/**
 * DTO de salida: expone solo lo que el frontend necesita ver de un apartamento.
 */
public record ApartamentoDTO(
        Long id,
        String numero,
        int piso,
        BigDecimal coeficienteCopropiedad,
        boolean activo,
        Long torreId,
        String torreNombre,
        String identificadorCompleto
) {

    /**
     * Convierte una entidad en su DTO. Debe llamarse dentro de una transacción
     * porque accede a la torre (relación LAZY).
     */
    public static ApartamentoDTO de(Apartamento apartamento) {
        return new ApartamentoDTO(
                apartamento.getId(),
                apartamento.getNumero(),
                apartamento.getPiso(),
                apartamento.getCoeficienteCopropiedad(),
                apartamento.isActivo(),
                apartamento.getTorre().getId(),
                apartamento.getTorre().getNombre(),
                apartamento.identificadorCompleto()
        );
    }
}
