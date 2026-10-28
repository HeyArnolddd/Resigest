package co.edu.uis.resigest.financiero.pdf;

import co.edu.uis.resigest.financiero.domain.Pago;

/**
 * Puerto de salida para generar el comprobante de un pago.
 */
public interface GeneradorComprobante {

    byte[] generar(Pago pago);
}
