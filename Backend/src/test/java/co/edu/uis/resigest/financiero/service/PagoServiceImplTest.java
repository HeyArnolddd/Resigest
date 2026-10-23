package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import co.edu.uis.resigest.financiero.domain.Pago;
import co.edu.uis.resigest.financiero.domain.PagoManual;
import co.edu.uis.resigest.financiero.dto.IniciarPagoRequest;
import co.edu.uis.resigest.financiero.dto.PagoDTO;
import co.edu.uis.resigest.financiero.dto.ValidarPagoRequest;
import co.edu.uis.resigest.financiero.gateway.PasarelaPago;
import co.edu.uis.resigest.financiero.gateway.RespuestaTransaccion;
import co.edu.uis.resigest.financiero.gateway.SolicitudPago;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.financiero.repository.PagoRepository;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PagoServiceImplTest {

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private ObligacionRepository obligacionRepository;

    @Mock
    private PasarelaPago pasarelaPago;

    @InjectMocks
    private PagoServiceImpl pagoService;

    private ObligacionFinanciera crearObligacion() {
        Torre torre = new Torre("1", 5);
        Apartamento apartamento = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        return new ObligacionFinanciera(apartamento, ConceptoCobro.ARRIENDO, "2026-10",
                new BigDecimal("1000.00"), LocalDate.of(2026, 10, 10));
    }

    @Test
    void iniciarPagoPasarelaApruebaYAplicaAbono() {
        ObligacionFinanciera obligacion = crearObligacion();

        when(obligacionRepository.findById(1L)).thenReturn(Optional.of(obligacion));
        when(pasarelaPago.cobrar(any(SolicitudPago.class)))
                .thenReturn(new RespuestaTransaccion(true, "SIM-1", "http://recibo"));

        PagoDTO dto = pagoService.iniciarPagoPasarela(new IniciarPagoRequest(1L));

        assertThat(dto.estado()).isEqualTo("APROBADO");
        assertThat(obligacion.estaSaldada()).isTrue();
        verify(pagoRepository).save(any(Pago.class));
    }

    @Test
    void validarPagoApruebaPagoManualYAplicaAbono() {
        ObligacionFinanciera obligacion = crearObligacion();
        PagoManual pago = new PagoManual(new BigDecimal("1000.00"), obligacion, "http://recibo.jpg");

        when(pagoRepository.findById(1L)).thenReturn(Optional.of(pago));

        PagoDTO dto = pagoService.validarPago(1L, new ValidarPagoRequest(true, null));

        assertThat(dto.estado()).isEqualTo("APROBADO");
        assertThat(obligacion.estaSaldada()).isTrue();
    }
}
