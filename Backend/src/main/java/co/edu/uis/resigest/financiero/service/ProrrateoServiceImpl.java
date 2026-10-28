package co.edu.uis.resigest.financiero.service;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.financiero.domain.ConceptoCobro;
import co.edu.uis.resigest.financiero.domain.DetalleProrrateo;
import co.edu.uis.resigest.financiero.domain.FacturaServicioComun;
import co.edu.uis.resigest.financiero.domain.ObligacionFinanciera;
import co.edu.uis.resigest.financiero.dto.ProrrateoDetalleDTO;
import co.edu.uis.resigest.financiero.dto.ProrrateoRequest;
import co.edu.uis.resigest.financiero.dto.ProrrateoResultadoDTO;
import co.edu.uis.resigest.financiero.repository.FacturaServicioRepository;
import co.edu.uis.resigest.financiero.repository.ObligacionRepository;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Cálculo del prorrateo de servicios comunes por coeficiente de copropiedad.
 */
@Service
public class ProrrateoServiceImpl implements ProrrateoService {

    private static final BigDecimal CIEN = new BigDecimal("100.0000");

    private final ApartamentoRepository apartamentoRepository;
    private final FacturaServicioRepository facturaServicioRepository;
    private final ObligacionRepository obligacionRepository;

    public ProrrateoServiceImpl(ApartamentoRepository apartamentoRepository,
                                FacturaServicioRepository facturaServicioRepository,
                                ObligacionRepository obligacionRepository) {
        this.apartamentoRepository = apartamentoRepository;
        this.facturaServicioRepository = facturaServicioRepository;
        this.obligacionRepository = obligacionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProrrateoDetalleDTO> preview(ProrrateoRequest request) {
        List<Apartamento> apartamentos = apartamentoRepository.findByActivoTrue();
        Map<Apartamento, BigDecimal> valores = calcularValores(request.total(), apartamentos);
        return aDetalles(valores);
    }

    @Override
    @Transactional
    public ProrrateoResultadoDTO confirmar(ProrrateoRequest request) {
        List<Apartamento> apartamentos = apartamentoRepository.findByActivoTrue();
        Map<Apartamento, BigDecimal> valores = calcularValores(request.total(), apartamentos);

        FacturaServicioComun factura = new FacturaServicioComun(request.tipo(), request.periodo(), request.total());
        for (Map.Entry<Apartamento, BigDecimal> e : valores.entrySet()) {
            factura.getDetalles().add(new DetalleProrrateo(factura, e.getKey(), e.getValue()));
        }
        facturaServicioRepository.save(factura);

        for (Map.Entry<Apartamento, BigDecimal> e : valores.entrySet()) {
            ObligacionFinanciera obligacion = new ObligacionFinanciera(
                    e.getKey(), ConceptoCobro.SERVICIO_PUBLICO, request.periodo(),
                    e.getValue(), LocalDate.now().plusDays(15));
            obligacionRepository.save(obligacion);
        }

        List<ProrrateoDetalleDTO> detalles = aDetalles(valores);
        return new ProrrateoResultadoDTO(factura.getId(), request.periodo(), request.total(), detalles);
    }

    private Map<Apartamento, BigDecimal> calcularValores(BigDecimal total, List<Apartamento> apartamentos) {
        BigDecimal sumaCoeficientes = apartamentos.stream()
                .map(Apartamento::getCoeficienteCopropiedad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (sumaCoeficientes.compareTo(CIEN) != 0) {
            throw new ReglaNegocioException("Los coeficientes de copropiedad deben sumar 100%");
        }

        Apartamento mayor = apartamentos.stream()
                .max(Comparator.comparing(Apartamento::getCoeficienteCopropiedad))
                .orElseThrow();

        Map<Apartamento, BigDecimal> valores = new LinkedHashMap<>();
        BigDecimal acumulado = BigDecimal.ZERO;
        for (Apartamento a : apartamentos) {
            BigDecimal valor = total.multiply(a.getCoeficienteCopropiedad())
                    .divide(CIEN, 2, RoundingMode.HALF_UP);
            valores.put(a, valor);
            acumulado = acumulado.add(valor);
        }

        // El centavo que queda por redondeo se asigna al de mayor coeficiente.
        BigDecimal diferencia = total.subtract(acumulado);
        if (diferencia.signum() != 0) {
            valores.put(mayor, valores.get(mayor).add(diferencia));
        }
        return valores;
    }

    private List<ProrrateoDetalleDTO> aDetalles(Map<Apartamento, BigDecimal> valores) {
        return valores.entrySet().stream()
                .map(e -> new ProrrateoDetalleDTO(
                        e.getKey().getId(),
                        e.getKey().identificadorCompleto(),
                        e.getKey().getCoeficienteCopropiedad(),
                        e.getValue()))
                .toList();
    }
}
