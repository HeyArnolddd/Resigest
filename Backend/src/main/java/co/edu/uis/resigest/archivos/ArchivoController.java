package co.edu.uis.resigest.archivos;

import co.edu.uis.resigest.mantenimiento.storage.AlmacenamientoArchivos;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Subida genérica de archivos (comprobantes de pago, evidencias) y descarga autenticada.
 */
@RestController
@RequestMapping("/api/archivos")
public class ArchivoController {

    private final AlmacenamientoArchivos almacenamiento;

    public ArchivoController(AlmacenamientoArchivos almacenamiento) {
        this.almacenamiento = almacenamiento;
    }

    @PostMapping
    public Map<String, String> subir(@RequestParam("archivo") MultipartFile archivo) {
        return Map.of("url", almacenamiento.guardar(archivo));
    }

    @GetMapping("/{nombre:.+}")
    public ResponseEntity<Resource> descargar(@PathVariable String nombre) {
        Resource recurso = almacenamiento.cargar(nombre);
        MediaType tipo = nombre.endsWith(".pdf") ? MediaType.APPLICATION_PDF
                : nombre.endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(tipo)
                .cacheControl(CacheControl.noStore())
                .body(recurso);
    }
}
