package co.edu.uis.resigest.common.domain;

import java.time.LocalDateTime;

/**
 * Base de los eventos de dominio: objetos en memoria que anuncian que algo
 * relevante ocurrió, para que otros módulos los escuchen sin acoplarse.
 */
public abstract class EventoDominio {

    private final LocalDateTime ocurridoEn = LocalDateTime.now();

    public LocalDateTime getOcurridoEn() {
        return ocurridoEn;
    }

    /** Cada evento concreto explica qué pasó, en pasado. */
    public abstract String descripcion();
}
