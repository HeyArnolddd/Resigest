package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.common.security.VerificadorPropietario;
import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import co.edu.uis.resigest.financiero.domain.Pago;
import co.edu.uis.resigest.financiero.domain.PagoManual;
import co.edu.uis.resigest.financiero.domain.PagoPasarela;
import co.edu.uis.resigest.financiero.dto.CheckoutPagoDTO;
import co.edu.uis.resigest.financiero.dto.PagoDTO;
import co.edu.uis.resigest.financiero.dto.ValidarPagoRequest;
import co.edu.uis.resigest.financiero.event.PagoAprobadoEvento;
import co.edu.uis.resigest.financiero.gateway.PayuCliente;
import co.edu.uis.resigest.financiero.gateway.TransaccionPasarela;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.financiero.repository.PagoRepository;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PagoServiceImplTest {

    private static final String REF = "RG-1-ABC";

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private ObligacionRepository obligacionRepository;

    @Mock
    private PayuCliente payu;

    @Mock
    private VerificadorPropietario verificadorPropietario;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private UsuarioAutenticado residente;

    private PagoServiceImpl pagoService;

    @BeforeEach
    void setUp() {
        pagoService = new PagoServiceImpl(pagoRepository, obligacionRepository, payu,
                verificadorPropietario, eventPublisher);
    }

    private ObligacionFinanciera crearObligacion() {
        Torre torre = new Torre("1", 5);
        Apartamento apartamento = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        return new ObligacionFinanciera(apartamento, ConceptoCobro.CUOTA_ADMINISTRACION, "2026-10",
                new BigDecimal("1000.00"), LocalDate.of(2026, 10, 10));
    }

    private PagoPasarela pagoIniciado(ObligacionFinanciera obligacion) {
        PagoPasarela pago = new PagoPasarela(obligacion.getSaldoPendiente(), obligacion);
        pago.setReferencia(REF);
        when(pagoRepository.findPasarelaParaActualizar(REF)).thenReturn(Optional.of(pago));
        return pago;
    }

    private void payuResponde(String estado, String valor) {
        when(payu.consultar(REF)).thenReturn(Optional.of(
                new TransaccionPasarela("T-1", REF, estado, new BigDecimal(valor), "COP")));
    }

    @Test
    void sinConfiguracionNoSePuedePagarEnLinea() {
        doThrow(new ReglaNegocioException("no configurado")).when(payu).exigirConfiguracion();

        assertThatThrownBy(() -> pagoService.iniciarPagoEnLinea(1L, residente))
                .isInstanceOf(ReglaNegocioException.class);
        verify(pagoRepository, never()).save(any());
    }

    @Test
    void iniciarCreaElPagoSinDarloPorPagado() {
        ObligacionFinanciera obligacion = crearObligacion();
        when(obligacionRepository.findById(1L)).thenReturn(Optional.of(obligacion));
        when(payu.getUrlCheckout()).thenReturn("https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/");
        when(payu.camposCheckout(anyString(), any(BigDecimal.class), anyString()))
                .thenReturn(Map.of("signature", "firma"));

        CheckoutPagoDTO checkout = pagoService.iniciarPagoEnLinea(1L, residente);

        ArgumentCaptor<Pago> captor = ArgumentCaptor.forClass(Pago.class);
        verify(pagoRepository).save(captor.capture());
        assertThat(captor.getValue().getEstado()).isEqualTo(EstadoPago.INICIADO);
        assertThat(checkout.referencia()).startsWith("RG-").isEqualTo(captor.getValue().getReferencia());
        assertThat(checkout.monto()).isEqualByComparingTo("1000");
        assertThat(checkout.campos()).containsEntry("signature", "firma");
        assertThat(obligacion.estaSaldada()).isFalse();
    }

    @Test
    void pagoAprobadoPorPayuSeAceptaEnseguidaYUnaSolaVez() {
        ObligacionFinanciera obligacion = crearObligacion();
        PagoPasarela pago = pagoIniciado(obligacion);
        payuResponde("APPROVED", "1000");

        PagoDTO dto = pagoService.verificarPagoEnLinea(REF, residente);
        pagoService.verificarPagoEnLinea(REF, residente);
        pagoService.procesarConfirmacion(REF);

        assertThat(dto.estado()).isEqualTo("APROBADO");
        assertThat(pago.getIdTransaccionExterna()).isEqualTo("T-1");
        assertThat(obligacion.estaSaldada()).isTrue();
        verify(payu, times(1)).consultar(REF);
        verify(eventPublisher, times(1)).publishEvent(any(PagoAprobadoEvento.class));
    }

    @Test
    void valorDistintoAlDeLaObligacionNoSeAprueba() {
        ObligacionFinanciera obligacion = crearObligacion();
        pagoIniciado(obligacion);
        payuResponde("APPROVED", "10");

        PagoDTO dto = pagoService.verificarPagoEnLinea(REF, residente);

        assertThat(dto.estado()).isEqualTo("RECHAZADO");
        assertThat(obligacion.estaSaldada()).isFalse();
    }

    @Test
    void pagoRechazadoPorPayuQuedaRechazado() {
        ObligacionFinanciera obligacion = crearObligacion();
        pagoIniciado(obligacion);
        payuResponde("DECLINED", "1000");

        PagoDTO dto = pagoService.verificarPagoEnLinea(REF, residente);

        assertThat(dto.estado()).isEqualTo("RECHAZADO");
        assertThat(dto.motivoRechazo()).isEqualTo("PayU rechazó el pago");
        assertThat(obligacion.estaSaldada()).isFalse();
    }

    @Test
    void pagoPendienteSigueIniciado() {
        ObligacionFinanciera obligacion = crearObligacion();
        pagoIniciado(obligacion);
        payuResponde("PENDING", "1000");

        assertThat(pagoService.verificarPagoEnLinea(REF, residente).estado()).isEqualTo("INICIADO");
        assertThat(obligacion.estaSaldada()).isFalse();
    }

    @Test
    void avisoSinConfiguracionNoConsultaNada() {
        when(payu.configurado()).thenReturn(false);

        pagoService.procesarConfirmacion(REF);

        verify(pagoRepository, never()).findPasarelaParaActualizar(anyString());
    }

    @Test
    void firmaYValorComoLosDocumentaPayu() {
        PayuCliente cliente = new PayuCliente("https://checkout", "https://consultas", "508029", "512321",
                "pRRXKOl8ikMmt9u", "4Vj8eK4rloUd272L48hsrarnUA", true, "");

        // Ejemplo oficial de la documentación de PayU (WebCheckout)
        assertThat(cliente.firma("TestPayU", "20000")).isEqualTo("7ee7cf808ce6a39b17481c54f2c57acc");
        assertThat(PayuCliente.montoTexto(new BigDecimal("150000.00"))).isEqualTo("150000");
        assertThat(PayuCliente.montoTexto(new BigDecimal("150000.5"))).isEqualTo("150000.50");
        assertThat(cliente.camposCheckout("R-1", new BigDecimal("20000.00"), "Cuota"))
                .containsEntry("amount", "20000")
                .containsEntry("test", "1")
                .doesNotContainKey("confirmationUrl");
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
