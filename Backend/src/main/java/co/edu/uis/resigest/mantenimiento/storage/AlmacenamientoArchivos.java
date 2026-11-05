package co.edu.uis.resigest.mantenimiento.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Puerto de salida para almacenar archivos (evidencias, comprobantes).
 * Permite cambiar el destino (disco local, nube...) sin tocar el servicio.
 */
public interface AlmacenamientoArchivos {

    /** Guarda el archivo y devuelve la URL relativa con la que se consulta. */
    String guardar(MultipartFile archivo);

    /** Devuelve el archivo guardado con ese nombre. */
    Resource cargar(String nombre);
}
