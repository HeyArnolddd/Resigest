package co.edu.uis.resigest.comunicaciones.channel;

import co.edu.uis.resigest.comunicaciones.domain.Notificacion;
import co.edu.uis.resigest.comunicaciones.domain.TipoCanal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Canal push. Implementación de referencia (stub): en producción enviaría a
 * FCM/APNs; aquí solo registra en el log.
 */
@Component
public class CanalPush implements CanalNotificacion {

    private static final Logger log = LoggerFactory.getLogger(CanalPush.class);

    @Override
    public boolean soporta(TipoCanal canal) {
        return canal == TipoCanal.PUSH;
    }

    @Override
    public void enviar(Notificacion notificacion) {
        log.info("[PUSH] Notificación para {}: {}", notificacion.getDestinatario().getCorreo(),
                notificacion.getTitulo());
    }
}
