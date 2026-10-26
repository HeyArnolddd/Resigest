package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.financiero.domain.TipoServicio;
import co.edu.uis.resigest.financiero.dto.ProrrateoDetalleDTO;
import co.edu.uis.resigest.financiero.dto.ProrrateoRequest;
import co.edu.uis.resigest.financiero.repository.FacturaServicioRepository;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProrrateoServiceImplTest {

    @Mock
    private ApartamentoRepository apartamentoRepository;

    @Mock
    private FacturaServicioRepository facturaServicioRepository;

    @Mock
    private ObligacionRepository obligacionRepository;

    @InjectMocks
    private ProrrateoServiceImpl prorrateoService;

    private Apartamento crearApartamento(String numero, String coeficiente) {
        Torre torre = new Torre("1", 5);
        return new Apartamento(numero, 1, new BigDecimal(coeficiente), torre);
    }

    @Test
    void previewCalculaValoresProporcionales() {
        Apartamento a1 = crearApartamento("101", "60.0000");
        Apartamento a2 = crearApartamento("102", "40.0000");
        when(apartamentoRepository.findByActivoTrue()).thenReturn(List.of(a1, a2));

        ProrrateoRequest request = new ProrrateoRequest(TipoServicio.AGUA, "2026-10", new BigDecimal("1000.00"));
        List<ProrrateoDetalleDTO> detalles = prorrateoService.preview(request);

        assertThat(detalles).hasSize(2);
        assertThat(detalles.get(0).valor()).isEqualByComparingTo(new BigDecimal("600.00"));
        assertThat(detalles.get(1).valor()).isEqualByComparingTo(new BigDecimal("400.00"));
    }

    @Test
    void previewRechazaCoeficientesQueNoSuman100() {
        Apartamento a1 = crearApartamento("101", "60.0000");
        Apartamento a2 = crearApartamento("102", "30.0000");
        when(apartamentoRepository.findByActivoTrue()).thenReturn(List.of(a1, a2));

        ProrrateoRequest request = new ProrrateoRequest(TipoServicio.AGUA, "2026-10", new BigDecimal("1000.00"));

        assertThatThrownBy(() -> prorrateoService.preview(request))
                .isInstanceOf(ReglaNegocioException.class);
    }
}
