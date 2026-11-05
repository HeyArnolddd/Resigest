package co.edu.uis.resigest.mantenimiento.storage;

import co.edu.uis.resigest.common.archivos.ArchivoService;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Guarda las evidencias en la tabla de archivos y devuelve su URL del API.
 */
@Component
public class AlmacenamientoBaseDatos implements AlmacenamientoArchivos {

    private final ArchivoService archivoService;

    public AlmacenamientoBaseDatos(ArchivoService archivoService) {
        this.archivoService = archivoService;
    }

    @Override
    public String guardar(MultipartFile archivo) {
        return archivoService.guardar(archivo, null).url();
    }
}
