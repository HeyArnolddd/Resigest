package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import co.edu.uis.resigest.financiero.domain.Pago;
import co.edu.uis.resigest.financiero.domain.PagoManual;
import co.edu.uis.resigest.financiero.domain.PagoPasarela;
import co.edu.uis.resigest.financiero.dto.IniciarPagoRequest;
import co.edu.uis.resigest.financiero.dto.PagoDTO;
import co.edu.uis.resigest.financiero.dto.ReportarPagoManualRequest;
import co.edu.uis.resigest.financiero.dto.ValidarPagoRequest;
import co.edu.uis.resigest.financiero.dto.WebhookPagoRequest;
import co.edu.uis.resigest.financiero.event.PagoAprobadoEvento;
import co.edu.uis.resigest.financiero.gateway.PasarelaPago;
import co.edu.uis.resigest.financiero.gateway.RespuestaTransaccion;
import co.edu.uis.resigest.financiero.gateway.SolicitudPago;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.financiero.repository.PagoRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Lógica de pagos: pasarela, pago manual y validación del administrador.
 */
@Service
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final ObligacionRepository obligacionRepository;
    private final PasarelaPago pasarelaPago;
    private final ApplicationEventPublisher eventPublisher;

    public PagoServiceImpl(PagoRepository pagoRepository,
                           ObligacionRepository obligacionRepository,
                           PasarelaPago pasarelaPago,
                           ApplicationEventPublisher eventPublisher) {
        this.pagoRepository = pagoRepository;
        this.obligacionRepository = obligacionRepository;
        this.pasarelaPago = pasarelaPago;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public PagoDTO iniciarPagoPasarela(IniciarPagoRequest request) {
        ObligacionFinanciera obligacion = buscarObligacion(request.obligacionId());
        validarNoSaldada(obligacion);

        PagoPasarela pago = new PagoPasarela(obligacion.getSaldoPendiente(), obligacion);
        RespuestaTransaccion respuesta = pasarelaPago.cobrar(
                new SolicitudPago("PAGO-" + UUID.randomUUID(), pago.getMonto()));

        if (respuesta.aprobada()) {
            pago.setIdTransaccionExterna(respuesta.idTransaccion());
            pago.setUrlRecibo(respuesta.urlRecibo());
            pago.aprobar();
            obligacion.registrarAbono(pago.getMonto());
            eventPublisher.publishEvent(new PagoAprobadoEvento(
                    obligacion.getApartamento().getId(), pago.getMonto()));
        } else {
            pago.rechazar("Rechazado por la pasarela");
        }

        pagoRepository.save(pago);
        return PagoDTO.de(pago);
    }

    @Override
    @Transactional
    public PagoDTO reportarPagoManual(ReportarPagoManualRequest request) {
        ObligacionFinanciera obligacion = buscarObligacion(request.obligacionId());
        validarNoSaldada(obligacion);

        PagoManual pago = new PagoManual(
                obligacion.getSaldoPendiente(), obligacion, request.urlComprobanteAdjunto());
        pagoRepository.save(pago);
        return PagoDTO.de(pago);
    }

    @Override
    @Transactional
    public PagoDTO validarPago(Long pagoId, ValidarPagoRequest request) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el pago con id " + pagoId));

        if (!pago.requiereValidacionManual()) {
            throw new ReglaNegocioException("Este pago no requiere validación manual");
        }

        if (request.aprobar()) {
            pago.aprobar();
            pago.getObligacion().registrarAbono(pago.getMonto());
            eventPublisher.publishEvent(new PagoAprobadoEvento(
                    pago.getObligacion().getApartamento().getId(), pago.getMonto()));
        } else {
            pago.rechazar(request.motivo());
            if (pago instanceof PagoManual manual) {
                manual.setObservacionAdmin(request.motivo());
            }
        }
        return PagoDTO.de(pago);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoDTO> listarPendientesValidacion() {
        return pagoRepository.findByEstado(EstadoPago.EN_VERIFICACION).stream()
                .map(PagoDTO::de)
                .toList();
    }

    @Override
    @Transactional
    public PagoDTO procesarWebhook(WebhookPagoRequest request) {
        Pago pago = pagoRepository.findByIdTransaccionExterna(request.idTransaccion())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Transacción no encontrada: " + request.idTransaccion()));

        if (request.aprobada()) {
            pago.aprobar();
            pago.getObligacion().registrarAbono(pago.getMonto());
        } else {
            pago.rechazar("Rechazado por la pasarela");
        }
        return PagoDTO.de(pago);
    }

    private ObligacionFinanciera buscarObligacion(Long id) {
        return obligacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la obligación con id " + id));
    }

    private void validarNoSaldada(ObligacionFinanciera obligacion) {
        if (obligacion.estaSaldada()) {
            throw new ReglaNegocioException("La obligación ya está saldada");
        }
    }
}
