package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import co.edu.uis.resigest.financiero.dto.EstadoCuentaDTO;
import co.edu.uis.resigest.financiero.dto.GenerarObligacionesRequest;
import co.edu.uis.resigest.financiero.dto.ObligacionDTO;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Lógica de cartera: estado de cuenta, generación de obligaciones y vencimiento.
 */
@Service
public class CarteraServiceImpl implements CarteraService {

    private final ObligacionRepository obligacionRepository;
    private final ApartamentoRepository apartamentoRepository;

    public CarteraServiceImpl(ObligacionRepository obligacionRepository,
                              ApartamentoRepository apartamentoRepository) {
        this.obligacionRepository = obligacionRepository;
        this.apartamentoRepository = apartamentoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public EstadoCuentaDTO estadoCuenta(Long apartamentoId) {
        Apartamento apartamento = apartamentoRepository.findById(apartamentoId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el apartamento con id " + apartamentoId));

        List<ObligacionDTO> obligaciones = obligacionRepository.findByApartamentoId(apartamentoId)
                .stream().map(ObligacionDTO::de).toList();

        BigDecimal totalPendiente = obligaciones.stream()
                .map(ObligacionDTO::saldoPendiente)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new EstadoCuentaDTO(
                apartamentoId,
                apartamento.identificadorCompleto(),
                totalPendiente,
                obligaciones);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ObligacionDTO> listarObligaciones(Long apartamentoId, EstadoObligacion estado) {
        List<ObligacionFinanciera> obligaciones;
        if (apartamentoId != null && estado != null) {
            obligaciones = obligacionRepository.findByApartamentoIdAndEstado(apartamentoId, estado);
        } else if (apartamentoId != null) {
            obligaciones = obligacionRepository.findByApartamentoId(apartamentoId);
        } else if (estado != null) {
            obligaciones = obligacionRepository.findByEstado(estado);
        } else {
            obligaciones = obligacionRepository.findAll();
        }
        return obligaciones.stream().map(ObligacionDTO::de).toList();
    }

    @Override
    @Transactional
    public List<ObligacionDTO> generarObligacionesMensuales(GenerarObligacionesRequest request) {
        List<Apartamento> apartamentos = apartamentoRepository.findByActivoTrue();
        List<ObligacionDTO> creadas = new ArrayList<>();

        for (Apartamento apartamento : apartamentos) {
            boolean yaExiste = obligacionRepository.existsByApartamentoIdAndConceptoAndPeriodo(
                    apartamento.getId(), request.concepto(), request.periodo());
            if (yaExiste) {
                continue; // idempotente: no duplicar el mismo mes
            }
            ObligacionFinanciera obligacion = new ObligacionFinanciera(
                    apartamento, request.concepto(), request.periodo(),
                    request.monto(), request.fechaVencimiento());
            obligacionRepository.save(obligacion);
            creadas.add(ObligacionDTO.de(obligacion));
        }
        return creadas;
    }

    /** Corre cada día a las 3:00 AM y marca como VENCIDA lo que ya pasó su fecha. */
    @Override
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void marcarVencidas() {
        List<ObligacionFinanciera> vencidas = obligacionRepository
                .findByEstadoAndFechaVencimientoBefore(EstadoObligacion.PENDIENTE, LocalDate.now());
        vencidas.forEach(ObligacionFinanciera::marcarVencida);
    }
}
