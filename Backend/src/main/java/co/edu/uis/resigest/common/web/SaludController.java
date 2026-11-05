package co.edu.uis.resigest.common.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Chequeo de salud público: Render lo consulta para saber si el backend ya arrancó.
 */
@RestController
public class SaludController {

    @GetMapping("/api/salud")
    public Map<String, String> salud() {
        return Map.of("estado", "ok");
    }
}
