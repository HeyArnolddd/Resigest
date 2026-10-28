package co.edu.uis.resigest.porteria.service;

import co.edu.uis.resigest.porteria.dto.EntregaPaqueteRequest;
import co.edu.uis.resigest.porteria.dto.PaqueteDTO;
import co.edu.uis.resigest.porteria.dto.RegistrarPaqueteRequest;

import java.util.List;

public interface PaqueteService {

    PaqueteDTO registrar(RegistrarPaqueteRequest request);

    PaqueteDTO entregar(Long id, EntregaPaqueteRequest request);

    List<PaqueteDTO> listarPorApartamento(Long apartamentoId);
}
