package co.edu.uis.resigest.reservas.service;

import co.edu.uis.resigest.reservas.dto.RechazoRequest;
import co.edu.uis.resigest.reservas.dto.ReservaDTO;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;

import java.util.List;

public interface ReservaService {

    ReservaDTO solicitar(SolicitudReservaRequest request, Long residenteId);

    ReservaDTO aprobar(Long id);

    ReservaDTO rechazar(Long id, RechazoRequest request);

    void cancelar(Long id);

    List<ReservaDTO> listarPorZona(Long zonaId);
}
