package co.edu.uis.resigest.reportes;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Indicadores del tablero del administrador. */
public record DashboardDTO(
        String periodo,
        BigDecimal facturado,
        BigDecimal recaudado,
        List<RecaudoMes> recaudoMensual,
        Cartera cartera,
        Map<String, Long> incidenciasPorEstado,
        List<UsoZona> usoZonas,
        Pendientes pendientes
) {
    public record RecaudoMes(String periodo, BigDecimal facturado, BigDecimal recaudado) {
    }

    public record Cartera(long apartamentos, long alDia, long enMora, BigDecimal saldoEnMora) {
    }

    public record UsoZona(Long zonaId, String nombre, long reservasMes) {
    }

    public record Pendientes(long pagosPorValidar, long reservasPorAprobar) {
    }
}
