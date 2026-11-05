package co.edu.uis.resigest.comunicaciones.dto;

/**
 * Chat comunitario al que tiene acceso el usuario. {@code torreId} null = chat general del conjunto.
 */
public record CanalComunidadDTO(
        Long torreId,
        String nombre
) {
}
