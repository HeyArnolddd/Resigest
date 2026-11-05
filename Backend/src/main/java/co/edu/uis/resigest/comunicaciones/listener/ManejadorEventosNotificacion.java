package co.edu.uis.resigest.comunicaciones.listener;

import co.edu.uis.resigest.porteria.event.IngresoRegistradoEvento;
import java.util.Locale;
import java.text.NumberFormat;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import co.edu.uis.resigest.mantenimiento.event.IncidenciaActualizadaEvento;
import co.edu.uis.resigest.porteria.event.PaqueteRecibidoEvento;
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
    private final UsuarioRepository usuarioRepository;

    public ManejadorEventosNotificacion(NotificacionService notificacionService,
                                        ResidenteRepository residenteRepository,
                                        UsuarioRepository usuarioRepository) {
        this.notificacionService = notificacionService;
        this.residenteRepository = residenteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReservaResuelta(ReservaResueltaEvento evento) {
        residenteRepository.findByApartamentoId(evento.getApartamentoId())
                .forEach(residente -> {
                    String titulo = evento.isAprobada() ? "Reserva aprobada" : "Reserva rechazada";
                    String mensaje = "Tu reserva de " + evento.getZonaNombre() + " fue "
                            + (evento.isAprobada() ? "aprobada" : "rechazada") + ".";
                    notificacionService.notificar(residente, titulo, mensaje,
                            TipoNotificacion.RESERVA, TipoCanal.PLATAFORMA, TipoCanal.PUSH);
                });
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPagoAprobado(PagoAprobadoEvento evento) {
        String monto = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-CO")).format(evento.getMonto());
        residenteRepository.findByApartamentoId(evento.getApartamentoId())
                .forEach(residente -> notificacionService.notificar(residente, "Pago aprobado",
                        "Tu pago de " + monto + " fue aprobado.",
                        TipoNotificacion.PAGO, TipoCanal.PLATAFORMA, TipoCanal.PUSH));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaqueteRecibido(PaqueteRecibidoEvento evento) {
        String mensaje = "Llegó un paquete" + (evento.getEmpresaTransportadora() != null
                ? " de " + evento.getEmpresaTransportadora() : "") + ". Recógelo en portería.";
        residenteRepository.findByApartamentoId(evento.getApartamentoId())
                .forEach(residente -> notificacionService.notificar(residente, "Tienes un paquete",
                        mensaje, TipoNotificacion.INGRESO, TipoCanal.PLATAFORMA, TipoCanal.PUSH));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onIncidenciaActualizada(IncidenciaActualizadaEvento evento) {
        String nombre = "\"" + evento.getTitulo() + "\"";
        String titulo = switch (evento.getTipo()) {
            case ASIGNADA -> "Nueva incidencia asignada";
            case RESUELTA -> "Confirma la solución";
            case CONFIRMADA -> "Solución confirmada";
            case REABIERTA -> "Incidencia reabierta";
        };
        String mensaje = switch (evento.getTipo()) {
            case ASIGNADA -> "Te asignaron " + nombre + ".";
            case RESUELTA -> "Mantenimiento resolvió " + nombre + ". Revisa la foto y confirma si quedó bien.";
            case CONFIRMADA -> "El residente confirmó que " + nombre + " quedó solucionada.";
            case REABIERTA -> "El residente indica que " + nombre + " sigue con problemas. Revisa su comentario.";
        };
        usuarioRepository.findById(evento.getDestinatarioId())
                .ifPresent(usuario -> notificacionService.notificar(usuario, titulo, mensaje,
                        TipoNotificacion.INCIDENCIA, TipoCanal.PLATAFORMA, TipoCanal.PUSH));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onIngresoRegistrado(IngresoRegistradoEvento evento) {
        String titulo = switch (evento.getTipo()) {
            case "DOMICILIO" -> "Llegó un domicilio";
            case "SERVICIO" -> "Llegó un técnico de servicio";
            default -> "Tienes una visita";
        };
        String mensaje = evento.getNombreVisitante() + " está en portería.";
        residenteRepository.findByApartamentoId(evento.getApartamentoId())
                .forEach(residente -> notificacionService.notificar(residente, titulo, mensaje,
                        TipoNotificacion.INGRESO, TipoCanal.PLATAFORMA, TipoCanal.PUSH));
    }
}
