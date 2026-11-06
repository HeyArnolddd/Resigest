package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.financiero.dto.CheckoutPagoDTO;
import co.edu.uis.resigest.financiero.dto.PagoDTO;
import co.edu.uis.resigest.financiero.dto.ReportarPagoManualRequest;
import co.edu.uis.resigest.financiero.dto.ValidarPagoRequest;

import java.util.List;

/**
 * Contrato del caso de uso de pagos (RF02 parte 2 · CU02, CU06).
 * Dos formas de pagar: en línea con PayU (se aprueba solo si PayU confirma el cobro)
 * o por transferencia con comprobante (la aprueba el administrador).
 */
public interface PagoService {

    /** Crea el pago (INICIADO) y devuelve la orden firmada para abrir la página de PayU. */
    CheckoutPagoDTO iniciarPagoEnLinea(Long obligacionId, UsuarioAutenticado autenticado);

    /** Consulta en PayU el pago con esa referencia y aplica su resultado. */
    PagoDTO verificarPagoEnLinea(String referencia, UsuarioAutenticado autenticado);

    /** Aviso de PayU (página de confirmación): vuelve a consultar el pago en PayU. */
    void procesarConfirmacion(String referencia);

    PagoDTO reportarPagoManual(ReportarPagoManualRequest request);

    PagoDTO validarPago(Long pagoId, ValidarPagoRequest request);

    List<PagoDTO> listarPendientesValidacion();

    List<PagoDTO> listarPorApartamento(Long apartamentoId);
}
