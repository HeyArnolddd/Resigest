package co.edu.uis.resigest.mantenimiento.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Puerto de salida para almacenar archivos (fotos de evidencias).
 * Permite cambiar el destino (disco local, nube...) sin tocar el servicio.
 */
public interface AlmacenamientoArchivos {

    String guardar(MultipartFile archivo);
}
