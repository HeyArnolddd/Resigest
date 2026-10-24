package co.edu.uis.resigest.porteria.service;

import co.edu.uis.resigest.porteria.dto.RegistrarIngresoRequest;
import co.edu.uis.resigest.porteria.dto.RegistroIngresoDTO;

import java.time.LocalDate;
import java.util.List;

public interface PorteriaService {

    RegistroIngresoDTO registrarIngreso(RegistrarIngresoRequest request, Long porteroId);

    void registrarSalida(Long id);

    List<RegistroIngresoDTO> consultarBitacora(LocalDate desde, LocalDate hasta);
}
