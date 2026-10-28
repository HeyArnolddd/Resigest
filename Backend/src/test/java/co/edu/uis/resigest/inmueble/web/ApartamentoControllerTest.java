package co.edu.uis.resigest.inmueble.web;

import co.edu.uis.resigest.inmueble.dto.ApartamentoDTO;
import co.edu.uis.resigest.inmueble.service.ApartamentoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApartamentoController.class)
@AutoConfigureMockMvc(addFilters = false)
class ApartamentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ApartamentoService apartamentoService;

    @Test
    void obtenerDevuelve200YNumero() throws Exception {
        ApartamentoDTO dto = new ApartamentoDTO(1L, "304", 3, new BigDecimal("12.3456"),
                true, 1L, "2", "Torre 2 – Apto 304");
        when(apartamentoService.obtener(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/apartamentos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numero").value("304"))
                .andExpect(jsonPath("$.torreNombre").value("2"));
    }
}
