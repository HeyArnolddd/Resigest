package co.edu.uis.resigest.reservas.service;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.CrearZonaComunRequest;
import co.edu.uis.resigest.reservas.dto.ZonaComunDTO;
import co.edu.uis.resigest.reservas.repository.ZonaComunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class ZonaComunServiceImpl implements ZonaComunService {

    private final ZonaComunRepository zonaComunRepository;

    public ZonaComunServiceImpl(ZonaComunRepository zonaComunRepository) {
        this.zonaComunRepository = zonaComunRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZonaComunDTO> listar() {
        return zonaComunRepository.findByActivaTrue().stream()
                .map(ZonaComunDTO::de)
                .toList();
    }

    @Override
    @Transactional
    public ZonaComunDTO crear(CrearZonaComunRequest request) {
        LocalTime apertura = request.horaApertura() != null ? request.horaApertura() : LocalTime.of(8, 0);
        LocalTime cierre = request.horaCierre() != null ? request.horaCierre() : LocalTime.of(20, 0);
        if (!apertura.isBefore(cierre)) {
            throw new ReglaNegocioException("La hora de apertura debe ser anterior a la de cierre");
        }
        ZonaComun zona = new ZonaComun(request.nombre(), request.descripcion(), request.capacidad(),
                apertura, cierre);
        zonaComunRepository.save(zona);
        return ZonaComunDTO.de(zona);
    }
}
