package co.edu.uis.resigest.reservas.service;

import co.edu.uis.resigest.reservas.dto.CrearZonaComunRequest;
import co.edu.uis.resigest.reservas.dto.ZonaComunDTO;

import java.util.List;

public interface ZonaComunService {

    List<ZonaComunDTO> listar();

    ZonaComunDTO crear(CrearZonaComunRequest request);
}
