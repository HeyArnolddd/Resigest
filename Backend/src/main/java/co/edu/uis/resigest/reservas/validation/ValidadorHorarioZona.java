package co.edu.uis.resigest.reservas.validation;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import org.springframework.stereotype.Component;

/**
 * Verifica que la zona esté habilitada y que el rango de horas sea válido.
 */
@Component
public class ValidadorHorarioZona implements ValidadorReserva {

    @Override
    public void validar(SolicitudReservaRequest request, Apartamento apartamento, ZonaComun zonaComun) {
        if (!zonaComun.isActiva()) {
            throw new ReglaNegocioException("La zona no está habilitada para reserva");
        }
        if (!request.fechaFin().isAfter(request.fechaInicio())) {
            throw new ReglaNegocioException("La hora de fin debe ser posterior a la de inicio");
        }
    }
}
