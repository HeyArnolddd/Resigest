package co.edu.uis.resigest.common.security;

import co.edu.uis.resigest.common.config.SecurityConfig;
import co.edu.uis.resigest.usuarios.service.UsuarioService;
import co.edu.uis.resigest.usuarios.web.UsuarioController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Verifica que los nombres de rol de @PreAuthorize coinciden con el enum Rol. */
@WebMvcTest(UsuarioController.class)
@Import(SecurityConfig.class)
class AutorizacionPorRolTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioService usuarioService;
    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void administradorPuedeListarUsuarios() throws Exception {
        when(usuarioService.listar(any(), any())).thenReturn(Page.empty());
        mockMvc.perform(get("/api/usuarios")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RESIDENTE")
    void residenteNoPuedeListarUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios")).andExpect(status().isForbidden());
    }

    @Test
    void sinTokenDevuelve401o403() throws Exception {
        mockMvc.perform(get("/api/usuarios")).andExpect(status().is4xxClientError());
    }
}
