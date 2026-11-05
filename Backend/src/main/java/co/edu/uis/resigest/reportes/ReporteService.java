package co.edu.uis.resigest.reportes;

import co.edu.uis.resigest.financiero.domain.EstadoObligacion;
import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.financiero.repository.PagoRepository;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.mantenimiento.domain.EstadoIncidencia;
import co.edu.uis.resigest.mantenimiento.repository.IncidenciaRepository;
import co.edu.uis.resigest.reservas.domain.EstadoReserva;
import co.edu.uis.resigest.reservas.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReporteService {

    private static final int MESES = 6;

    private final ObligacionRepository obligacionRepository;
    private final PagoRepository pagoRepository;
    private final ApartamentoRepository apartamentoRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final ReservaRepository reservaRepository;

    public ReporteService(ObligacionRepository obligacionRepository, PagoRepository pagoRepository,
                          ApartamentoRepository apartamentoRepository, IncidenciaRepository incidenciaRepository,
                          ReservaRepository reservaRepository) {
        this.obligacionRepository = obligacionRepository;
        this.pagoRepository = pagoRepository;
        this.apartamentoRepository = apartamentoRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.reservaRepository = reservaRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO dashboard() {
        YearMonth actual = YearMonth.now();
        String periodo = actual.toString();

        // Recaudo de los últimos MESES meses, rellenando con ceros los meses sin obligaciones.
        Map<String, BigDecimal[]> porPeriodo = new LinkedHashMap<>();
        for (int i = MESES - 1; i >= 0; i--) {
            porPeriodo.put(actual.minusMonths(i).toString(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
        }
        for (Object[] fila : obligacionRepository.totalesPorPeriodo()) {
            BigDecimal[] valores = porPeriodo.get((String) fila[0]);
            if (valores != null) {
                valores[0] = (BigDecimal) fila[1];
                valores[1] = (BigDecimal) fila[2];
            }
        }
        List<DashboardDTO.RecaudoMes> recaudoMensual = new ArrayList<>();
        porPeriodo.forEach((p, v) -> recaudoMensual.add(new DashboardDTO.RecaudoMes(p, v[0], v[1])));
        BigDecimal[] mes = porPeriodo.get(periodo);

        long apartamentos = apartamentoRepository.findByActivoTrue().size();
        long enMora = obligacionRepository.contarApartamentosConEstado(EstadoObligacion.VENCIDA);
        BigDecimal saldoEnMora = obligacionRepository.saldoPorEstado(EstadoObligacion.VENCIDA);

        Map<EstadoIncidencia, Long> conteo = new EnumMap<>(EstadoIncidencia.class);
        for (EstadoIncidencia e : EstadoIncidencia.values()) {
            conteo.put(e, 0L);
        }
        incidenciaRepository.findAll().forEach(i -> conteo.merge(i.getEstado(), 1L, Long::sum));
        Map<String, Long> incidenciasPorEstado = new LinkedHashMap<>();
        conteo.forEach((e, n) -> incidenciasPorEstado.put(e.name(), n));

        LocalDate inicioMes = actual.atDay(1);
        List<DashboardDTO.UsoZona> usoZonas = new ArrayList<>();
        for (Object[] fila : reservaRepository.usoPorZona(
                EstadoReserva.APROBADA, inicioMes.atStartOfDay(), actual.plusMonths(1).atDay(1).atStartOfDay())) {
            usoZonas.add(new DashboardDTO.UsoZona((Long) fila[0], (String) fila[1], (Long) fila[2]));
        }
        Collections.sort(usoZonas, (a, b) -> Long.compare(b.reservasMes(), a.reservasMes()));

        long pagosPorValidar = pagoRepository.findByEstado(EstadoPago.EN_VERIFICACION).size();
        long reservasPorAprobar = reservaRepository.countByEstado(EstadoReserva.PENDIENTE);

        return new DashboardDTO(
                periodo, mes[0], mes[1], recaudoMensual,
                new DashboardDTO.Cartera(apartamentos, Math.max(apartamentos - enMora, 0), enMora, saldoEnMora),
                incidenciasPorEstado, usoZonas,
                new DashboardDTO.Pendientes(pagosPorValidar, reservasPorAprobar));
    }
}
