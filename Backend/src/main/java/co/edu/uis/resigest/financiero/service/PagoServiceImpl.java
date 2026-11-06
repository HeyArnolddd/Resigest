package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.archivos.ArchivoService;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.common.security.VerificadorPropietario;
import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import co.edu.uis.resigest.financiero.domain.Pago;
import co.edu.uis.resigest.financiero.domain.PagoManual;
import co.edu.uis.resigest.financiero.domain.PagoPasarela;
import co.edu.uis.resigest.financiero.dto.CheckoutPagoDTO;
import co.edu.uis.resigest.financiero.dto.PagoDTO;
import co.edu.uis.resigest.financiero.dto.ReportarPagoManualRequest;
import co.edu.uis.resigest.financiero.dto.ValidarPagoRequest;
import co.edu.uis.resigest.financiero.event.PagoAprobadoEvento;
import co.edu.uis.resigest.financiero.gateway.PayuCliente;
import co.edu.uis.resigest.financiero.gateway.TransaccionPasarela;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.financiero.repository.PagoRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Lógica de pagos: pago en línea con PayU, pago manual y validación del administrador.
 * Un pago en línea se aprueba en cuanto PayU confirma el cobro; uno manual, cuando el
 * administrador revisa el comprobante.
 */
@Service
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final ObligacionRepository obligacionRepository;
    private final PayuCliente payu;
    private final VerificadorPropietario verificadorPropietario;
    private final ApplicationEventPublisher eventPublisher;

    public PagoServiceImpl(PagoRepository pagoRepository,
                           ObligacionRepository obligacionRepository,
                           PayuCliente payu,
                           VerificadorPropietario verificadorPropietario,
                           ApplicationEventPublisher eventPublisher) {
        this.pagoRepository = pagoRepository;
        this.obligacionRepository = obligacionRepository;
        this.payu = payu;
        this.verificadorPropietario = verificadorPropietario;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public CheckoutPagoDTO iniciarPagoEnLinea(Long obligacionId, UsuarioAutenticado autenticado) {
        payu.exigirConfiguracion();
        ObligacionFinanciera obligacion = buscarObligacion(obligacionId);
        verificadorPropietario.verificarApartamento(obligacion.getApartamento().getId(), autenticado);
        validarNoSaldada(obligacion);
        if (obligacion.estaEnVerificacion()) {
            throw new ReglaNegocioException("Ya reportaste un pago para esta obligación; está en verificación");
        }

        PagoPasarela pago = new PagoPasarela(obligacion.getSaldoPendiente(), obligacion);
        // Única en todo PayU: el sandbox lo comparten muchos comercios de prueba
        String referencia = "RG-" + obligacion.getId() + "-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
        pago.setReferencia(referencia);
        pagoRepository.save(pago);

        String descripcion = "ResiGest - " + nombreConcepto(obligacion) + " " + obligacion.getPeriodo()
                + " - " + obligacion.getApartamento().identificadorCompleto();
        return new CheckoutPagoDTO(pago.getId(), referencia, pago.getMonto(), payu.getUrlCheckout(),
                payu.camposCheckout(referencia, pago.getMonto(), descripcion));
    }

    @Override
    @Transactional
    public PagoDTO verificarPagoEnLinea(String referencia, UsuarioAutenticado autenticado) {
        payu.exigirConfiguracion();
        PagoPasarela pago = pagoRepository.findPasarelaParaActualizar(referencia)
                .orElseThrow(() -> new RecursoNoEncontradoException("No encontramos ese pago en ResiGest"));
        verificadorPropietario.verificarApartamento(pago.getObligacion().getApartamento().getId(), autenticado);
        if (pago.getEstado() == EstadoPago.INICIADO) {
            payu.consultar(referencia).ifPresent(transaccion -> aplicar(pago, transaccion));
        }
        return PagoDTO.de(pago);
    }

    @Override
    @Transactional
    public void procesarConfirmacion(String referencia) {
        if (!payu.configurado()) {
            return;
        }
        // No se le cree al aviso: el resultado se confirma preguntándole a PayU.
        pagoRepository.findPasarelaParaActualizar(referencia)
                .filter(pago -> pago.getEstado() == EstadoPago.INICIADO)
                .ifPresent(pago -> payu.consultar(referencia).ifPresent(transaccion -> aplicar(pago, transaccion)));
    }

    /**
     * Aplica lo que dice PayU. Solo cambia pagos INICIADOS, así que repetirlo
     * (regreso del residente + aviso de PayU) no abona dos veces.
     */
    private void aplicar(PagoPasarela pago, TransaccionPasarela transaccion) {
        if (pago.getEstado() != EstadoPago.INICIADO || transaccion.pendiente()) {
            return; // PENDING: sigue INICIADO hasta que PayU avise o el residente vuelva a consultar.
        }
        pago.setIdTransaccionExterna(transaccion.id());
        if (transaccion.fallida()) {
            pago.rechazar(motivoRechazo(transaccion.estado()));
            return;
        }
        if (!PayuCliente.MONEDA.equals(transaccion.moneda()) || transaccion.valor() == null
                || transaccion.valor().compareTo(pago.getMonto()) != 0) {
            pago.rechazar("PayU cobró un valor distinto al de la obligación; revisar con administración");
            return;
        }
        pago.aprobar();
        ObligacionFinanciera obligacion = pago.getObligacion();
        BigDecimal abono = pago.getMonto().min(obligacion.getSaldoPendiente());
        if (abono.signum() > 0) {
            obligacion.registrarAbono(abono);
        }
        eventPublisher.publishEvent(new PagoAprobadoEvento(
                obligacion.getApartamento().getId(), pago.getMonto()));
    }

    private static String motivoRechazo(String estado) {
        if ("DECLINED".equals(estado)) {
            return "PayU rechazó el pago";
        }
        if ("EXPIRED".equals(estado)) {
            return "El pago expiró en PayU sin completarse";
        }
        return "El pago no se completó en PayU";
    }

    private static String nombreConcepto(ObligacionFinanciera obligacion) {
        String nombre = obligacion.getConcepto().name().replace('_', ' ').toLowerCase(Locale.ROOT);
        return Character.toUpperCase(nombre.charAt(0)) + nombre.substring(1);
    }

    @Override
    @Transactional
    public PagoDTO reportarPagoManual(ReportarPagoManualRequest request) {
        ObligacionFinanciera obligacion = buscarObligacion(request.obligacionId());
        validarNoSaldada(obligacion);

        if (!ArchivoService.esUrlPropia(request.urlComprobanteAdjunto())) {
            throw new ReglaNegocioException("Adjunta el comprobante (foto o PDF) de la transferencia");
        }
        if (obligacion.estaEnVerificacion()) {
            throw new ReglaNegocioException("Ya reportaste un pago para esta obligación; está en verificación");
        }
        PagoManual pago = new PagoManual(
                obligacion.getSaldoPendiente(), obligacion, request.urlComprobanteAdjunto());
        pago.setReferencia(request.referencia());
        obligacion.marcarEnVerificacion();
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
            pago.getObligacion().reabrir();
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

    @Override
    @Transactional(readOnly = true)
    public List<PagoDTO> listarPorApartamento(Long apartamentoId) {
        // Los pagos en línea que el residente abrió y no terminó no son historial.
        return pagoRepository.findByObligacionApartamentoIdOrderByFechaDesc(apartamentoId).stream()
                .filter(p -> !(p instanceof PagoPasarela && p.getEstado() == EstadoPago.INICIADO))
                .map(PagoDTO::de)
                .toList();
    }
}
