package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.Comunicado;

import java.time.LocalDateTime;

public record ComunicadoDTO(
        Long id,
        String titulo,
        String cuerpo,
        String urlAdjunto,
        boolean fijado,
        Long autorId,
        LocalDateTime fechaPublicacion
) {

    public static ComunicadoDTO de(Comunicado comunicado) {
        return new ComunicadoDTO(
                comunicado.getId(),
                comunicado.getTitulo(),
                comunicado.getCuerpo(),
                comunicado.getUrlAdjunto(),
                comunicado.isFijado(),
                comunicado.getAutor().getId(),
                comunicado.getFechaPublicacion()
        );
    }
}
