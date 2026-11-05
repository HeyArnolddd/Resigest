package co.edu.uis.resigest.mantenimiento.service;

import java.util.List;
import co.edu.uis.resigest.mantenimiento.dto.AsignarRequest;
import co.edu.uis.resigest.mantenimiento.dto.CrearIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.dto.IncidenciaDTO;
import co.edu.uis.resigest.mantenimiento.dto.ResolverIncidenciaRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface IncidenciaService {

    IncidenciaDTO reportar(CrearIncidenciaRequest request, Long usuarioId);

    /** Solo quien reportó la incidencia puede adjuntarle fotos. */
    IncidenciaDTO agregarEvidencia(Long incidenciaId, MultipartFile archivo, Long usuarioId);

    IncidenciaDTO asignar(Long incidenciaId, AsignarRequest request);

    /** El técnico marca que empezó a trabajar (ASIGNADA → EN_PROCESO). Solo el técnico asignado. */
    IncidenciaDTO iniciar(Long incidenciaId, Long tecnicoId);

    /** Solo el técnico asignado puede resolverla. */
    IncidenciaDTO resolver(Long incidenciaId, ResolverIncidenciaRequest request, Long tecnicoId);

    /** Las que reportó el usuario (residente o portero). */
    List<IncidenciaDTO> listarReportadasPor(Long usuarioId);

    List<IncidenciaDTO> listarAsignadasA(Long tecnicoId);

    Page<IncidenciaDTO> listar(Pageable pageable);
}
