package co.edu.uis.resigest.financiero.web;

import co.edu.uis.resigest.common.config.SecurityConfig;
import co.edu.uis.resigest.common.security.JwtService;
import co.edu.uis.resigest.common.security.UsuarioDetailsService;
import co.edu.uis.resigest.financiero.service.PagoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WebhookController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "app.webhook.secret=secreto-test")
class WebhookControllerTest {

    private static final String CUERPO = "{\"idTransaccion\":\"tx-1\",\"aprobada\":true}";

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private PagoService pagoService;
    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @Test
    void sinFirmaDevuelve401() throws Exception {
        mockMvc.perform(post("/api/pagos/webhook").contentType(MediaType.APPLICATION_JSON).content(CUERPO))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void firmaIncorrectaDevuelve401() throws Exception {
        mockMvc.perform(post("/api/pagos/webhook").contentType(MediaType.APPLICATION_JSON)
                        .header("X-Signature", "abcd").content(CUERPO))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void firmaValidaDevuelve200() throws Exception {
        mockMvc.perform(post("/api/pagos/webhook").contentType(MediaType.APPLICATION_JSON)
                        .header("X-Signature", firmar("tx-1:true")).content(CUERPO))
                .andExpect(status().isOk());
    }

    private static String firmar(String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("secreto-test".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
