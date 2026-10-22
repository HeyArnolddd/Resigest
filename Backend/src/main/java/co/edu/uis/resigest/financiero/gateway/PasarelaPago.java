package co.edu.uis.resigest.financiero.gateway;

/**
 * Puerto de salida hacia la pasarela de pagos. Permite sustituir Wompi por una
 * implementación simulada sin tocar el servicio.
 */
public interface PasarelaPago {

    RespuestaTransaccion cobrar(SolicitudPago solicitud);
}
