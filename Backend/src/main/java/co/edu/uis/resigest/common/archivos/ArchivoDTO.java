package co.edu.uis.resigest.common.archivos;

/**
 * Archivo ya guardado. {@code url} es la ruta del API para descargarlo (requiere token).
 */
public record ArchivoDTO(
        Long id,
        String nombre,
        String tipoContenido,
        long tamano,
        String url
) {
    public static ArchivoDTO de(Archivo archivo) {
        return new ArchivoDTO(archivo.getId(), archivo.getNombre(), archivo.getTipoContenido(),
                archivo.getTamano(), ArchivoService.url(archivo.getId()));
    }
}
