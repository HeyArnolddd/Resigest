package co.edu.uis.resigest.inmueble.service;

import co.edu.uis.resigest.common.exception.ConflictoException;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.inmueble.domain.Torre;
import co.edu.uis.resigest.inmueble.dto.CrearTorreRequest;
import co.edu.uis.resigest.inmueble.dto.TorreDTO;
import co.edu.uis.resigest.inmueble.repository.TorreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación del caso de uso de torres: crear, obtener y listar.
 */
@Service
public class TorreServiceImpl implements TorreService {

    private final TorreRepository torreRepository;

    public TorreServiceImpl(TorreRepository torreRepository) {
        this.torreRepository = torreRepository;
    }

    @Override
    @Transactional
    public TorreDTO crear(CrearTorreRequest request) {
        if (torreRepository.findByNombre(request.nombre()).isPresent()) {
            throw new ConflictoException("Ya existe una torre con el nombre " + request.nombre());
        }

        Torre torre = new Torre(request.nombre(), request.numeroPisos());
        torreRepository.save(torre);
        return TorreDTO.de(torre);
    }

    @Override
    @Transactional(readOnly = true)
    public TorreDTO obtener(Long id) {
        Torre torre = torreRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la torre con id " + id));
        return TorreDTO.de(torre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TorreDTO> listar() {
        return torreRepository.findAll().stream()
                .map(TorreDTO::de)
                .toList();
    }
}
