package co.edu.uis.resigest.porteria.service;

import co.edu.uis.resigest.porteria.dto.EntregaPaqueteRequest;
import co.edu.uis.resigest.porteria.dto.PaqueteDTO;
import co.edu.uis.resigest.porteria.dto.RegistrarPaqueteRequest;

import java.util.List;

public interface PaqueteService {

    PaqueteDTO registrar(RegistrarPaqueteRequest request);

    PaqueteDTO entregar(Long id, EntregaPaqueteRequest request);

    /** El residente confirma que ya lo recogió en portería. */
    PaqueteDTO confirmarRecogido(Long id, String nombreResidente);

    Long apartamentoDe(Long id);

    /** Con apartamentoId en null devuelve los paquetes de todo el conjunto (portería y administración). */
    List<PaqueteDTO> listar(Long apartamentoId);
}
