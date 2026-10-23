package co.edu.uis.resigest.reservas.validation;

import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;

/**
 * Contrato de una regla de validación de reserva (RF03). Cada regla vive en su
 * propia clase y Spring inyecta todas en una lista.
 */
public interface ValidadorReserva {

    void validar(SolicitudReservaRequest request, Apartamento apartamento, ZonaComun zonaComun);
}
