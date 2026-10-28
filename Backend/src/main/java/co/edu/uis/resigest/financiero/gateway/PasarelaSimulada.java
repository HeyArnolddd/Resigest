package co.edu.uis.resigest.financiero.gateway;

import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Implementación de prueba de la pasarela: aprueba siempre de inmediato.
 * Se reemplaza por {@code WompiPasarelaAdapter} cuando haya credenciales reales.
 */
@Component
public class PasarelaSimulada implements PasarelaPago {

    @Override
    public RespuestaTransaccion cobrar(SolicitudPago solicitud) {
        return new RespuestaTransaccion(
                true,
                "SIM-" + UUID.randomUUID(),
                "https://wompi.co/recibo/simulado");
    }
}
