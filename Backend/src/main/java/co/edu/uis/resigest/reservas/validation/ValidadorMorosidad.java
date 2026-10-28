package co.edu.uis.resigest.reservas.validation;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import org.springframework.stereotype.Component;

/**
 * Rechaza la reserva si el apartamento tiene obligaciones pendientes o vencidas.
 */
@Component
public class ValidadorMorosidad implements ValidadorReserva {

    private final ObligacionRepository obligacionRepository;

    public ValidadorMorosidad(ObligacionRepository obligacionRepository) {
        this.obligacionRepository = obligacionRepository;
    }

    @Override
    public void validar(SolicitudReservaRequest request, Apartamento apartamento, ZonaComun zonaComun) {
        boolean enMora = obligacionRepository.findByApartamentoId(apartamento.getId()).stream()
                .anyMatch(o -> o.getEstado() == EstadoObligacion.PENDIENTE
                        || o.getEstado() == EstadoObligacion.VENCIDA);
        if (enMora) {
            throw new ReglaNegocioException("El apartamento tiene obligaciones pendientes o vencidas");
        }
    }
}
