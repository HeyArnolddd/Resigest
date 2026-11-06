package co.edu.uis.resigest.financiero.gateway;

import java.math.BigDecimal;

/**
 * Transacción tal como la reporta la pasarela (PayU).
 *
 * @param estado APPROVED, DECLINED, PENDING, ERROR, EXPIRED…; {@code null} si la orden aún no tiene transacciones
 */
public record TransaccionPasarela(
        String id,
        String referencia,
        String estado,
        BigDecimal valor,
        String moneda
) {

    public boolean aprobada() {
        return "APPROVED".equals(estado);
    }

    public boolean pendiente() {
        return estado == null || "PENDING".equals(estado);
    }

    /** Estado final sin cobro: rechazada, expirada, con error, abandonada… */
    public boolean fallida() {
        return !aprobada() && !pendiente();
    }
}
