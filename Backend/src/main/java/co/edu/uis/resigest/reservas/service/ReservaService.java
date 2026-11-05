package co.edu.uis.resigest.reservas.service;

import co.edu.uis.resigest.reservas.domain.EstadoReserva;
import co.edu.uis.resigest.reservas.dto.RechazoRequest;
import co.edu.uis.resigest.reservas.dto.ReservaDTO;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;

import java.time.LocalDate;
import java.util.List;

public interface ReservaService {

    ReservaDTO solicitar(SolicitudReservaRequest request, Long residenteId);

    ReservaDTO aprobar(Long id);

    ReservaDTO rechazar(Long id, RechazoRequest request);

    void cancelar(Long id, Long residenteId);

    /** Lista reservas con filtros opcionales; {@code mias} restringe al apartamento del residente. */
    List<ReservaDTO> listar(Long zonaId, EstadoReserva estado, boolean mias,
                            LocalDate desde, LocalDate hasta, Long usuarioId);
}
