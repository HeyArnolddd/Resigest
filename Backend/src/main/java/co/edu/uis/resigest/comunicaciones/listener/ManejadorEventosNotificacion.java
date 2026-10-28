package co.edu.uis.resigest.comunicaciones.listener;

import co.edu.uis.resigest.comunicaciones.domain.TipoCanal;
import co.edu.uis.resigest.comunicaciones.domain.TipoNotificacion;
import co.edu.uis.resigest.comunicaciones.service.NotificacionService;
import co.edu.uis.resigest.financiero.event.PagoAprobadoEvento;
import co.edu.uis.resigest.reservas.event.ReservaResueltaEvento;
import co.edu.uis.resigest.usuarios.repository.ResidenteRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Escucha los eventos de dominio y genera notificaciones.
 * AFTER_COMMIT evita notificar algo que luego se revierte.
 */
@Component
public class ManejadorEventosNotificacion {

    private final NotificacionService notificacionService;
    private final ResidenteRepository residenteRepository;

    public ManejadorEventosNotificacion(NotificacionService notificacionService,
                                        ResidenteRepository residenteRepository) {
        this.notificacionService = notificacionService;
        this.residenteRepository = residenteRepository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReservaResuelta(ReservaResueltaEvento evento) {
        residenteRepository.findByApartamentoId(evento.getApartamentoId()).stream()
                .findFirst()
                .ifPresent(residente -> {
                    String titulo = evento.isAprobada() ? "Reserva aprobada" : "Reserva rechazada";
                    String mensaje = "Tu reserva de " + evento.getZonaNombre() + " fue "
                            + (evento.isAprobada() ? "aprobada" : "rechazada") + ".";
                    notificacionService.notificar(residente, titulo, mensaje,
                            TipoNotificacion.RESERVA, TipoCanal.PLATAFORMA, TipoCanal.PUSH);
                });
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPagoAprobado(PagoAprobadoEvento evento) {
        residenteRepository.findByApartamentoId(evento.getApartamentoId()).stream()
                .findFirst()
                .ifPresent(residente -> notificacionService.notificar(residente, "Pago aprobado",
                        "Tu pago de " + evento.getMonto() + " fue aprobado.",
                        TipoNotificacion.PAGO, TipoCanal.PLATAFORMA, TipoCanal.PUSH));
    }
}
