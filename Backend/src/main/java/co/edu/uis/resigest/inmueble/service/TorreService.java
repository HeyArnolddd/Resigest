package co.edu.uis.resigest.inmueble.service;

import co.edu.uis.resigest.inmueble.dto.CrearTorreRequest;
import co.edu.uis.resigest.inmueble.dto.TorreDTO;

import java.util.List;

/**
 * Contrato del módulo de torres.
 */
public interface TorreService {

    TorreDTO crear(CrearTorreRequest request);

    TorreDTO obtener(Long id);

    List<TorreDTO> listar();
}
