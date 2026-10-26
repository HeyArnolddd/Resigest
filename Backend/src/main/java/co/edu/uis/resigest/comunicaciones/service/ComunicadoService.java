package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.comunicaciones.dto.ComunicadoDTO;
import co.edu.uis.resigest.comunicaciones.dto.CrearComunicadoRequest;

import java.util.List;

public interface ComunicadoService {

    ComunicadoDTO publicar(CrearComunicadoRequest request, Long autorId);

    List<ComunicadoDTO> listar(boolean soloFijados);
}
