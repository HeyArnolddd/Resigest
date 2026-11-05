package co.edu.uis.resigest.mantenimiento.domain;

/**
 * Estado del ciclo de vida de una incidencia.
 */
public enum EstadoIncidencia {
    ABIERTA,
    ASIGNADA,
    EN_PROCESO,
    /** El técnico la resolvió; falta que quien la reportó confirme. */
    RESUELTA,
    /** Quien la reportó confirmó que quedó solucionada. */
    CERRADA
}
