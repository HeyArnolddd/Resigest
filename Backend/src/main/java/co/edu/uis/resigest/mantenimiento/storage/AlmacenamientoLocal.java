package co.edu.uis.resigest.mantenimiento.storage;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Guarda los archivos en disco ({@code app.uploads.dir}) con un nombre generado.
 * Solo admite JPG, PNG y PDF; el nombre original del cliente nunca se usa como ruta.
 */
@Component
public class AlmacenamientoLocal implements AlmacenamientoArchivos {

    private static final Map<String, String> EXTENSIONES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "application/pdf", ".pdf");

    private final Path directorio;

    public AlmacenamientoLocal(@Value("${app.uploads.dir:uploads}") String directorio) {
        this.directorio = Path.of(directorio).toAbsolutePath().normalize();
    }

    @Override
    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ReglaNegocioException("El archivo está vacío");
        }
        String extension = EXTENSIONES.get(archivo.getContentType());
        if (extension == null) {
            throw new ReglaNegocioException("Solo se permiten archivos JPG, PNG o PDF");
        }
        String nombre = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(directorio);
            Files.copy(archivo.getInputStream(), directorio.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar el archivo", e);
        }
        return "/api/archivos/" + nombre;
    }

    @Override
    public Resource cargar(String nombre) {
        Path ruta = directorio.resolve(nombre).normalize();
        if (!ruta.startsWith(directorio) || !Files.isRegularFile(ruta)) {
            throw new RecursoNoEncontradoException("No existe el archivo " + nombre);
        }
        return new PathResource(ruta);
    }
}
