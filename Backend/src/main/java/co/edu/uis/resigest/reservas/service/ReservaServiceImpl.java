package co.edu.uis.resigest.reservas.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.reservas.domain.Reserva;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.RechazoRequest;
import co.edu.uis.resigest.reservas.dto.ReservaDTO;
import co.edu.uis.resigest.reservas.dto.SolicitudReservaRequest;
import co.edu.uis.resigest.reservas.repository.ReservaRepository;
import co.edu.uis.resigest.reservas.repository.ZonaComunRepository;
import co.edu.uis.resigest.reservas.validation.ValidadorReserva;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.repository.ResidenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica de reservas: solicitar (con todos los validadores), aprobar, rechazar y cancelar.
 */
@Service
public class ReservaServiceImpl implements ReservaService {

    private final ReservaRepository reservaRepository;
    private final ZonaComunRepository zonaComunRepository;
    private final ResidenteRepository residenteRepository;
    private final List<ValidadorReserva> validadores;

    public ReservaServiceImpl(ReservaRepository reservaRepository,
                              ZonaComunRepository zonaComunRepository,
                              ResidenteRepository residenteRepository,
                              List<ValidadorReserva> validadores) {
        this.reservaRepository = reservaRepository;
        this.zonaComunRepository = zonaComunRepository;
        this.residenteRepository = residenteRepository;
        this.validadores = validadores;
    }

    @Override
    @Transactional
    public ReservaDTO solicitar(SolicitudReservaRequest request, Long residenteId) {
        Residente residente = residenteRepository.findById(residenteId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el residente con id " + residenteId));
        ZonaComun zonaComun = zonaComunRepository.findById(request.zonaComunId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la zona con id " + request.zonaComunId()));

        Apartamento apartamento = residente.getApartamento();
        validadores.forEach(v -> v.validar(request, apartamento, zonaComun));

        Reserva reserva = new Reserva(zonaComun, apartamento, request.fechaInicio(), request.fechaFin());
        reservaRepository.save(reserva);
        return ReservaDTO.de(reserva);
    }

    @Override
    @Transactional
    public ReservaDTO aprobar(Long id) {
        Reserva reserva = buscarReserva(id);
        reserva.aprobar();
        return ReservaDTO.de(reserva);
    }

    @Override
    @Transactional
    public ReservaDTO rechazar(Long id, RechazoRequest request) {
        Reserva reserva = buscarReserva(id);
        reserva.rechazar();
        return ReservaDTO.de(reserva);
    }

    @Override
    @Transactional
    public void cancelar(Long id) {
        Reserva reserva = buscarReserva(id);
        reserva.cancelar();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaDTO> listarPorZona(Long zonaId) {
        return reservaRepository.findByZonaComunId(zonaId).stream()
                .map(ReservaDTO::de)
                .toList();
    }

    private Reserva buscarReserva(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la reserva con id " + id));
    }
}
