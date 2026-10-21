package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.dto.EstadoCuentaDTO;
import co.edu.uis.resigest.financiero.dto.GenerarObligacionesRequest;
import co.edu.uis.resigest.financiero.dto.ObligacionDTO;

import java.util.List;

/**
 * Contrato del caso de uso de cartera (RF02 parte 1 · CU11).
 */
public interface CarteraService {

    EstadoCuentaDTO estadoCuenta(Long apartamentoId);

    List<ObligacionDTO> listarObligaciones(Long apartamentoId, EstadoObligacion estado);

    List<ObligacionDTO> generarObligacionesMensuales(GenerarObligacionesRequest request);

    void marcarVencidas();
}
