package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import co.edu.uis.resigest.financiero.dto.GenerarObligacionesRequest;
import co.edu.uis.resigest.financiero.dto.ObligacionDTO;
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
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarteraServiceImplTest {

    @Mock
    private ObligacionRepository obligacionRepository;

    @Mock
    private ApartamentoRepository apartamentoRepository;

    @InjectMocks
    private CarteraServiceImpl carteraService;

    @Test
    void generarObligacionesCreaParaCadaApartamentoActivo() {
        Torre torre = new Torre("1", 5);
        Apartamento apto1 = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        Apartamento apto2 = new Apartamento("102", 1, new BigDecimal("50.0000"), torre);

        when(apartamentoRepository.findByActivoTrue()).thenReturn(List.of(apto1, apto2));
        when(obligacionRepository.existsByApartamentoIdAndConceptoAndPeriodo(
                anyLong(), any(ConceptoCobro.class), anyString())).thenReturn(false);

        GenerarObligacionesRequest request = new GenerarObligacionesRequest(
                "2026-10", ConceptoCobro.ARRIENDO, new BigDecimal("1000.00"),
                LocalDate.of(2026, 10, 10));

        List<ObligacionDTO> creadas = carteraService.generarObligacionesMensuales(request);

        assertThat(creadas).hasSize(2);
        verify(obligacionRepository, times(2)).save(any(ObligacionFinanciera.class));
    }
}
