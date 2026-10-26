package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.financiero.dto.ProrrateoDetalleDTO;
import co.edu.uis.resigest.financiero.dto.ProrrateoRequest;
import co.edu.uis.resigest.financiero.dto.ProrrateoResultadoDTO;

import java.util.List;

public interface ProrrateoService {

    List<ProrrateoDetalleDTO> preview(ProrrateoRequest request);

    ProrrateoResultadoDTO confirmar(ProrrateoRequest request);
}
