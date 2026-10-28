package co.edu.uis.resigest.reservas.validation;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Limita la duración máxima de una reserva.
 */
@Component
public class ValidadorMaxHoras implements ValidadorReserva {

    private static final int MAX_HORAS = 6;

    @Override
    public void validar(SolicitudReservaRequest request, Apartamento apartamento, ZonaComun zonaComun) {
        long horas = Duration.between(request.fechaInicio(), request.fechaFin()).toHours();
        if (horas > MAX_HORAS) {
            throw new ReglaNegocioException("La reserva no puede superar " + MAX_HORAS + " horas");
        }
    }
}
