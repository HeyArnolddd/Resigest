package co.edu.uis.resigest.financiero.gateway;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Habla con PayU Latam (WebCheckout). El residente paga en la página de PayU; este
 * cliente firma la orden de pago y después le pregunta a PayU (API de consultas) por
 * el resultado, así nunca se da por pagado algo que PayU no aprobó.
 *
 * Por defecto usa el ambiente de pruebas (sandbox) con las credenciales públicas
 * que PayU publica en su documentación: no se mueve dinero real.
 */
@Component
public class PayuCliente {

    public static final String MONEDA = "COP";

    private final RestClient restClient;
    private final String urlCheckout;
    private final String urlConsultas;
    private final String merchantId;
    private final String accountId;
    private final String apiLogin;
    private final String apiKey;
    private final boolean pruebas;
    private final String urlConfirmacion;

    public PayuCliente(@Value("${app.payu.url-checkout:}") String urlCheckout,
                       @Value("${app.payu.url-consultas:}") String urlConsultas,
                       @Value("${app.payu.merchant-id:}") String merchantId,
                       @Value("${app.payu.account-id:}") String accountId,
                       @Value("${app.payu.api-login:}") String apiLogin,
                       @Value("${app.payu.api-key:}") String apiKey,
                       @Value("${app.payu.pruebas:true}") boolean pruebas,
                       @Value("${app.payu.url-confirmacion:}") String urlConfirmacion) {
        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(5000);
        fabrica.setReadTimeout(15000);
        this.restClient = RestClient.builder().requestFactory(fabrica).build();
        this.urlCheckout = urlCheckout.trim();
        this.urlConsultas = urlConsultas.trim();
        this.merchantId = merchantId.trim();
        this.accountId = accountId.trim();
        this.apiLogin = apiLogin.trim();
        this.apiKey = apiKey.trim();
        this.pruebas = pruebas;
        this.urlConfirmacion = urlConfirmacion.trim();
    }

    public boolean configurado() {
        return !merchantId.isEmpty() && !accountId.isEmpty() && !apiLogin.isEmpty() && !apiKey.isEmpty();
    }

    public void exigirConfiguracion() {
        if (!configurado()) {
            throw new ReglaNegocioException(
                    "El pago en línea no está configurado. Paga por transferencia y adjunta el comprobante.");
        }
    }

    public String getUrlCheckout() {
        return urlCheckout;
    }

    /**
     * Campos firmados del formulario de WebCheckout. El frontend agrega los que no van
     * en la firma (correo y nombre del comprador, URL de respuesta) y lo envía por POST.
     */
    public Map<String, String> camposCheckout(String referencia, BigDecimal monto, String descripcion) {
        String valor = montoTexto(monto);
        Map<String, String> campos = new LinkedHashMap<>();
        campos.put("merchantId", merchantId);
        campos.put("accountId", accountId);
        campos.put("description", descripcion);
        campos.put("referenceCode", referencia);
        campos.put("amount", valor);
        campos.put("tax", "0");
        campos.put("taxReturnBase", "0");
        campos.put("currency", MONEDA);
        campos.put("signature", firma(referencia, valor));
        campos.put("test", pruebas ? "1" : "0");
        campos.put("lng", "es");
        if (!urlConfirmacion.isEmpty()) {
            campos.put("confirmationUrl", urlConfirmacion);
        }
        return campos;
    }

    /** Firma del formulario: MD5("ApiKey~merchantId~referenceCode~amount~currency"). */
    public String firma(String referencia, String valor) {
        return md5(apiKey + "~" + merchantId + "~" + referencia + "~" + valor + "~" + MONEDA);
    }

    /** "150000" si no tiene centavos, "150000.50" si los tiene (PayU acepta hasta dos decimales). */
    public static String montoTexto(BigDecimal monto) {
        BigDecimal valor = monto.setScale(2, RoundingMode.HALF_UP);
        return valor.stripTrailingZeros().scale() <= 0
                ? valor.setScale(0, RoundingMode.UNNECESSARY).toPlainString()
                : valor.toPlainString();
    }

    /**
     * Consulta en PayU la orden con esa referencia. Si hay varios intentos, toma el
     * aprobado; si no, el pendiente; si no, el último. Vacío si PayU no conoce la referencia.
     */
    public Optional<TransaccionPasarela> consultar(String referencia) {
        Map<?, ?> respuesta;
        try {
            respuesta = restClient.post()
                    .uri(urlConsultas)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "test", false,
                            "language", "es",
                            "command", "ORDER_DETAIL_BY_REFERENCE_CODE",
                            "merchant", Map.of("apiLogin", apiLogin, "apiKey", apiKey),
                            "details", Map.of("referenceCode", referencia)))
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new ReglaNegocioException("No pudimos comunicarnos con PayU. Intenta de nuevo en un momento.");
        }
        if (respuesta == null || !"SUCCESS".equals(respuesta.get("code"))) {
            throw new ReglaNegocioException("PayU no respondió la consulta del pago. Intenta de nuevo en un momento.");
        }
        if (!(respuesta.get("result") instanceof Map<?, ?> resultado)
                || !(resultado.get("payload") instanceof List<?> ordenes) || ordenes.isEmpty()) {
            return Optional.empty();
        }

        TransaccionPasarela elegida = null;
        for (Object orden : ordenes) {
            if (!(orden instanceof Map<?, ?> o) || !referencia.equals(texto(o.get("referenceCode")))) {
                continue;
            }
            List<?> transacciones = o.get("transactions") instanceof List<?> l ? l : List.of();
            if (transacciones.isEmpty() && elegida == null) {
                elegida = new TransaccionPasarela(null, referencia, null, null, null);
            }
            for (Object t : transacciones) {
                if (t instanceof Map<?, ?> tx) {
                    TransaccionPasarela actual = leer(tx, referencia);
                    if (elegida == null || prioridad(actual) >= prioridad(elegida)) {
                        elegida = actual;
                    }
                }
            }
        }
        return Optional.ofNullable(elegida);
    }

    private static TransaccionPasarela leer(Map<?, ?> tx, String referencia) {
        String estado = tx.get("transactionResponse") instanceof Map<?, ?> r ? texto(r.get("state")) : null;
        BigDecimal valor = null;
        String moneda = null;
        if (tx.get("additionalValues") instanceof Map<?, ?> adicionales
                && adicionales.get("TX_VALUE") instanceof Map<?, ?> tv) {
            valor = tv.get("value") == null ? null : new BigDecimal(tv.get("value").toString());
            moneda = texto(tv.get("currency"));
        }
        return new TransaccionPasarela(texto(tx.get("id")), referencia, estado, valor, moneda);
    }

    private static int prioridad(TransaccionPasarela t) {
        return t.aprobada() ? 2 : t.pendiente() ? 1 : 0;
    }

    private static String texto(Object valor) {
        return valor == null ? null : valor.toString();
    }

    private static String md5(String valor) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("MD5").digest(valor.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
