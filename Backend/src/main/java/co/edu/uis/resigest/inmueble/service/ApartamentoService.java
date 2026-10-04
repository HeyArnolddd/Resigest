package co.edu.uis.resigest.inmueble.service;

import co.edu.uis.resigest.inmueble.dto.ApartamentoDTO;
import co.edu.uis.resigest.inmueble.dto.CrearApartamentoRequest;

import java.util.List;

/**
 * Contrato del módulo de apartamentos: qué operaciones se pueden hacer.
 */
public interface ApartamentoService {

    ApartamentoDTO crear(CrearApartamentoRequest request);

    ApartamentoDTO obtener(Long id);

    List<ApartamentoDTO> listar();
}
