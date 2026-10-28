package co.edu.uis.resigest.reservas.validation;

import co.edu.uis.resigest.common.exception.ConflictoException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.reservas.domain.EstadoReserva;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import co.edu.uis.resigest.reservas.repository.ReservaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Impide reservar un horario que ya esté ocupado por una reserva activa.
 */
@Component
public class ValidadorSolapamiento implements ValidadorReserva {

    private final ReservaRepository reservaRepository;

    public ValidadorSolapamiento(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    @Override
    public void validar(SolicitudReservaRequest request, Apartamento apartamento, ZonaComun zonaComun) {
        List<EstadoReserva> activas = List.of(EstadoReserva.PENDIENTE, EstadoReserva.APROBADA);
        boolean haySolape = !reservaRepository.findSolapadas(
                zonaComun.getId(), activas, request.fechaInicio(), request.fechaFin()).isEmpty();
        if (haySolape) {
            throw new ConflictoException("La zona ya está reservada en ese horario");
        }
    }
}
