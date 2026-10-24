package co.edu.uis.resigest.mantenimiento.service;

import co.edu.uis.resigest.mantenimiento.dto.AsignarRequest;
import co.edu.uis.resigest.mantenimiento.dto.CrearIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.dto.IncidenciaDTO;
import co.edu.uis.resigest.mantenimiento.dto.ResolverIncidenciaRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IncidenciaService {

    IncidenciaDTO reportar(CrearIncidenciaRequest request, Long usuarioId);

    IncidenciaDTO agregarEvidencia(Long incidenciaId, MultipartFile archivo);

    IncidenciaDTO asignar(Long incidenciaId, AsignarRequest request);

    IncidenciaDTO resolver(Long incidenciaId, ResolverIncidenciaRequest request);

    List<IncidenciaDTO> listar();
}
