package co.edu.uis.resigest.mantenimiento.storage;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Implementación de prueba: devuelve una ruta simulada. En producción se
 * reemplaza por almacenamiento real (disco o nube).
 */
@Component
public class AlmacenamientoLocal implements AlmacenamientoArchivos {

    @Override
    public String guardar(MultipartFile archivo) {
        return "uploads/" + archivo.getOriginalFilename();
    }
}
