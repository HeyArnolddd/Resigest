package co.edu.uis.resigest.porteria.dto;

import co.edu.uis.resigest.porteria.domain.Paquete;

import java.time.LocalDateTime;

public record PaqueteDTO(
        Long id,
        Long apartamentoDestinoId,
        String apartamento,
        String empresaTransportadora,
        String descripcion,
        String guia,
        String tamano,
        String fotoUrl,
        String estado,
        LocalDateTime fechaRecepcion,
        LocalDateTime fechaEntrega,
        String entregadoA
) {

    public static PaqueteDTO de(Paquete paquete) {
        return new PaqueteDTO(
                paquete.getId(),
                paquete.getApartamentoDestino().getId(),
                paquete.getApartamentoDestino().identificadorCompleto(),
                paquete.getEmpresaTransportadora(),
                paquete.getDescripcion(),
                paquete.getGuia(),
                paquete.getTamano(),
                paquete.getFotoUrl(),
                paquete.getEstado().name(),
                paquete.getFechaRecepcion(),
                paquete.getFechaEntrega(),
                paquete.getEntregadoA()
        );
    }
}
