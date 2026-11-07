package co.edu.uis.resigest.reservas.validation;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

/**
 * Verifica que la zona esté habilitada, que el rango de horas sea válido y que quede dentro del
 * horario de la zona (mismo día, entre la hora de apertura y la de cierre).
 */
@Component
public class ValidadorHorarioZona implements ValidadorReserva {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public void validar(SolicitudReservaRequest request, Apartamento apartamento, ZonaComun zonaComun) {
        if (!zonaComun.isActiva()) {
            throw new ReglaNegocioException("La zona no está habilitada para reserva");
        }
        if (!request.fechaFin().isAfter(request.fechaInicio())) {
            throw new ReglaNegocioException("La hora de fin debe ser posterior a la de inicio");
        }
        if (!zonaComun.dentroDelHorario(request.fechaInicio(), request.fechaFin())) {
            throw new ReglaNegocioException(String.format("%s solo se puede reservar el mismo día entre las %s y las %s",
                    zonaComun.getNombre(), HORA.format(zonaComun.getHoraApertura()), HORA.format(zonaComun.getHoraCierre())));
        }
    }
}
