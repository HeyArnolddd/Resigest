package co.edu.uis.resigest.mantenimiento.service;

import co.edu.uis.resigest.mantenimiento.dto.AsignarRequest;
import co.edu.uis.resigest.mantenimiento.dto.CrearIncidenciaRequest;
import co.edu.uis.resigest.mantenimiento.dto.FiltroIncidencias;
import co.edu.uis.resigest.mantenimiento.dto.IncidenciaDTO;
import co.edu.uis.resigest.mantenimiento.dto.ResolverIncidenciaRequest;
import co.edu.uis.resigest.usuarios.domain.Rol;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface IncidenciaService {

    IncidenciaDTO reportar(CrearIncidenciaRequest request, Long usuarioId);

    IncidenciaDTO agregarEvidencia(Long incidenciaId, MultipartFile archivo);

    IncidenciaDTO asignar(Long incidenciaId, AsignarRequest request);

    IncidenciaDTO resolver(Long incidenciaId, ResolverIncidenciaRequest request);

    IncidenciaDTO iniciar(Long incidenciaId, Long tecnicoId);

    /**
     * Lista incidencias según el rol del solicitante: administrador y mantenimiento ven todas;
     * residente y portero solo las que reportaron. Los filtros son opcionales.
     */
    Page<IncidenciaDTO> listar(FiltroIncidencias filtro, Long usuarioId, Rol rol, Pageable pageable);
}
