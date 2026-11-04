package co.edu.uis.resigest.financiero.gateway;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Implementación de prueba de la pasarela: aprueba siempre de inmediato.
 * Se activa por defecto ({@code app.pasarela=simulada}); con
 * {@code app.pasarela=wompi} entra {@code WompiPasarelaAdapter}.
 */
@Component
@ConditionalOnProperty(name = "app.pasarela", havingValue = "simulada", matchIfMissing = true)
public class PasarelaSimulada implements PasarelaPago {

    @Override
    public RespuestaTransaccion cobrar(SolicitudPago solicitud) {
        return new RespuestaTransaccion(
                true,
                "SIM-" + UUID.randomUUID(),
                "https://wompi.co/recibo/simulado");
    }
}
