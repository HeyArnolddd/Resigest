package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.financiero.dto.IniciarPagoRequest;
import co.edu.uis.resigest.financiero.dto.PagoDTO;
import co.edu.uis.resigest.financiero.dto.ReportarPagoManualRequest;
import co.edu.uis.resigest.financiero.dto.ValidarPagoRequest;
import co.edu.uis.resigest.financiero.dto.WebhookPagoRequest;

import java.util.List;

/**
 * Contrato del caso de uso de pagos (RF02 parte 2 · CU02, CU06).
 */
public interface PagoService {

    PagoDTO iniciarPagoPasarela(IniciarPagoRequest request);

    PagoDTO reportarPagoManual(ReportarPagoManualRequest request);

    PagoDTO validarPago(Long pagoId, ValidarPagoRequest request);

    List<PagoDTO> listarPendientesValidacion();

    PagoDTO procesarWebhook(WebhookPagoRequest request);
}
