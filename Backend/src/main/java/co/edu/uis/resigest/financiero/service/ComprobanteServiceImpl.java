package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.financiero.domain.Pago;
import co.edu.uis.resigest.financiero.pdf.GeneradorComprobante;
import co.edu.uis.resigest.financiero.repository.PagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Genera el comprobante en PDF de un pago.
 */
@Service
public class ComprobanteServiceImpl implements ComprobanteService {

    private final PagoRepository pagoRepository;
    private final GeneradorComprobante generadorComprobante;

    public ComprobanteServiceImpl(PagoRepository pagoRepository,
                                  GeneradorComprobante generadorComprobante) {
        this.pagoRepository = pagoRepository;
        this.generadorComprobante = generadorComprobante;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generar(Long pagoId) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el pago con id " + pagoId));
        return generadorComprobante.generar(pago);
    }
}
