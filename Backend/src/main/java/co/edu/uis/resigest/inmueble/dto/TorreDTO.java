package co.edu.uis.resigest.inmueble.dto;

import co.edu.uis.resigest.inmueble.domain.Torre;

/**
 * DTO de salida de una torre.
 */
public record TorreDTO(
        Long id,
        String nombre,
        int numeroPisos
) {

    public static TorreDTO de(Torre torre) {
        return new TorreDTO(torre.getId(), torre.getNombre(), torre.getNumeroPisos());
    }
}
