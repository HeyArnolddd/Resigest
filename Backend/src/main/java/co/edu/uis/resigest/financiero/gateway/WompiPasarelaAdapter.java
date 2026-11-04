package co.edu.uis.resigest.financiero.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Adaptador real de Wompi. Se activa con {@code app.pasarela=wompi} y requiere
 * las llaves en configuración/variables de entorno.
 *
 * Nota: la transacción de Wompi necesita un {@code payment_method} con un token
 * que el frontend obtiene del widget de Wompi. Sin ese token, Wompi rechaza la
 * transacción; el adaptador queda listo para conectarse cuando el front lo integre.
 */
@Component
@ConditionalOnProperty(name = "app.pasarela", havingValue = "wompi")
public class WompiPasarelaAdapter implements PasarelaPago {

    private final RestClient restClient;
    private final String url;
    private final String llavePublica;
    private final String llavePrivada;
    private final String correoCliente;

    public WompiPasarelaAdapter(RestClient.Builder builder,
                                @Value("${app.wompi.url:https://sandbox.wompi.co/v1}") String url,
                                @Value("${app.wompi.llave-publica:}") String llavePublica,
                                @Value("${app.wompi.llave-privada:}") String llavePrivada,
                                @Value("${app.wompi.correo-cliente:cliente@resigest.com}") String correoCliente) {
        this.restClient = builder.build();
        this.url = url;
        this.llavePublica = llavePublica;
        this.llavePrivada = llavePrivada;
        this.correoCliente = correoCliente;
    }

    @Override
    public RespuestaTransaccion cobrar(SolicitudPago solicitud) {
        try {
            Map<String, Object> body = Map.of(
                    "amount_in_cents", solicitud.monto().multiply(BigDecimal.valueOf(100)).intValue(),
                    "currency", "COP",
                    "customer_email", correoCliente,
                    "reference", solicitud.referencia(),
                    "public_key", llavePublica);

            Map<?, ?> respuesta = restClient.post()
                    .uri(url + "/transactions")
                    .header("Authorization", "Bearer " + llavePrivada)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (respuesta != null && respuesta.get("data") instanceof Map<?, ?> data) {
                boolean aprobada = "APPROVED".equals(data.get("status"));
                String id = data.get("id") != null ? data.get("id").toString() : null;
                return new RespuestaTransaccion(aprobada, id, null);
            }
            return new RespuestaTransaccion(false, null, null);
        } catch (Exception e) {
            return new RespuestaTransaccion(false, null, null);
        }
    }
}
