package co.edu.uis.resigest.comunicaciones.channel;

import co.edu.uis.resigest.comunicaciones.domain.Notificacion;
import co.edu.uis.resigest.comunicaciones.domain.TipoCanal;

/**
 * Puerto de salida para entregar una notificación por un canal.
 * Spring inyecta todas las implementaciones en una lista.
 */
public interface CanalNotificacion {

    boolean soporta(TipoCanal canal);

    void enviar(Notificacion notificacion);
}
