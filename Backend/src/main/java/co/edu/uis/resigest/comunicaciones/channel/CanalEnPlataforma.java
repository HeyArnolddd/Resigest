package co.edu.uis.resigest.comunicaciones.channel;

import co.edu.uis.resigest.comunicaciones.domain.Notificacion;
import co.edu.uis.resigest.comunicaciones.domain.TipoCanal;
import org.springframework.stereotype.Component;

/**
 * Canal "en plataforma": la notificación ya quedó guardada en base por el
 * servicio, así que este canal no tiene entrega adicional.
 */
@Component
public class CanalEnPlataforma implements CanalNotificacion {

    @Override
    public boolean soporta(TipoCanal canal) {
        return canal == TipoCanal.PLATAFORMA;
    }

    @Override
    public void enviar(Notificacion notificacion) {
        // Sin acción adicional: la notificación ya está persistida.
    }
}
