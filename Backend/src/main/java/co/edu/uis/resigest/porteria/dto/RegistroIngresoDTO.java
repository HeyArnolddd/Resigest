package co.edu.uis.resigest.porteria.dto;

import co.edu.uis.resigest.porteria.domain.RegistroIngreso;

import java.time.LocalDateTime;

public record RegistroIngresoDTO(
        Long id,
        String nombreVisitante,
        String documento,
        String tipo,
        String empresa,
        Long apartamentoDestinoId,
        Long registradoPorId,
        LocalDateTime fechaIngreso,
        LocalDateTime fechaSalida
) {

    public static RegistroIngresoDTO de(RegistroIngreso registro) {
        return new RegistroIngresoDTO(
                registro.getId(),
                registro.getNombreVisitante(),
                registro.getDocumento(),
                registro.getTipo().name(),
                registro.getEmpresa(),
                registro.getApartamentoDestino().getId(),
                registro.getRegistradoPor().getId(),
                registro.getFechaIngreso(),
                registro.getFechaSalida()
        );
    }
}
