package co.edu.uis.resigest.common.archivos;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Subida y descarga de archivos. Cualquier usuario autenticado puede subir; descargar
 * exige token (las imágenes del frontend se piden con el token y se muestran como blob).
 */
@RestController
@RequestMapping("/api/archivos")
public class ArchivoController {

    private final ArchivoService archivoService;

    public ArchivoController(ArchivoService archivoService) {
        this.archivoService = archivoService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArchivoDTO> subir(@RequestParam("archivo") MultipartFile archivo,
                                            @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        ArchivoDTO guardado = archivoService.guardar(archivo, autenticado.getId());
        return ResponseEntity.created(URI.create(guardado.url())).body(guardado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> descargar(@PathVariable Long id) {
        Archivo archivo = archivoService.obtener(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(archivo.getTipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(archivo.getNombre(), StandardCharsets.UTF_8).build().toString())
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePrivate())
                .body(archivo.getDatos());
    }
}
