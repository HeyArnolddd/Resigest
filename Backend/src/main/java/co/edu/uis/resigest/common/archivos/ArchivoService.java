package co.edu.uis.resigest.common.archivos;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

/**
 * Guarda y entrega los archivos subidos. Solo acepta imágenes (JPG, PNG, WEBP) y PDF;
 * el tamaño máximo (5 MB) lo controla spring.servlet.multipart.
 */
@Service
public class ArchivoService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf");
    private static final String PREFIJO_URL = "/api/archivos/";

    private final ArchivoRepository archivoRepository;

    public ArchivoService(ArchivoRepository archivoRepository) {
        this.archivoRepository = archivoRepository;
    }

    public static String url(Long id) {
        return PREFIJO_URL + id;
    }

    /** true si la URL apunta a un archivo subido a este backend. */
    public static boolean esUrlPropia(String url) {
        return url != null && url.matches("/api/archivos/\\d+");
    }

    @Transactional
    public ArchivoDTO guardar(MultipartFile archivo, Long usuarioId) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ReglaNegocioException("El archivo está vacío");
        }
        String tipo = archivo.getContentType();
        if (tipo == null || !TIPOS_PERMITIDOS.contains(tipo)) {
            throw new ReglaNegocioException("Solo se permiten imágenes JPG, PNG o WEBP, o documentos PDF");
        }
        String nombre = archivo.getOriginalFilename() == null || archivo.getOriginalFilename().isBlank()
                ? "archivo" : archivo.getOriginalFilename();
        try {
            Archivo guardado = archivoRepository.save(new Archivo(nombre, tipo, archivo.getBytes(), usuarioId));
            return ArchivoDTO.de(guardado);
        } catch (IOException e) {
            throw new ReglaNegocioException("No se pudo leer el archivo. Intenta de nuevo.");
        }
    }

    @Transactional(readOnly = true)
    public Archivo obtener(Long id) {
        return archivoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el archivo con id " + id));
    }
}
