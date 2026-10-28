package co.edu.uis.resigest.financiero.dto;

/**
 * Cuerpo que envía la pasarela al webhook para confirmar una transacción.
 */
public record WebhookPagoRequest(
        String idTransaccion,
        boolean aprobada
) {
}
