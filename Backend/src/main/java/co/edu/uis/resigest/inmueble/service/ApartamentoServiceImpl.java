package co.edu.uis.resigest.inmueble.service;

import co.edu.uis.resigest.common.exception.ConflictoException;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import co.edu.uis.resigest.inmueble.dto.ApartamentoDTO;
import co.edu.uis.resigest.inmueble.dto.CrearApartamentoRequest;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.inmueble.repository.TorreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación del caso de uso de apartamentos: crear, obtener y listar.
 * La lógica de negocio vive aquí; el controlador solo traduce HTTP.
 */
@Service
public class ApartamentoServiceImpl implements ApartamentoService {

    private final ApartamentoRepository apartamentoRepository;
    private final TorreRepository torreRepository;

    public ApartamentoServiceImpl(ApartamentoRepository apartamentoRepository,
                                  TorreRepository torreRepository) {
        this.apartamentoRepository = apartamentoRepository;
        this.torreRepository = torreRepository;
    }

    @Override
    @Transactional
    public ApartamentoDTO crear(CrearApartamentoRequest request) {
        Torre torre = torreRepository.findById(request.torreId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe la torre con id " + request.torreId()));

        boolean yaExiste = apartamentoRepository
                .findByTorreIdAndNumero(request.torreId(), request.numero())
                .isPresent();
        if (yaExiste) {
            throw new ConflictoException(
                    "Ya existe el apartamento " + request.numero() + " en la torre " + torre.getNombre());
        }

        Apartamento apartamento = new Apartamento(
                request.numero(),
                request.piso(),
                request.coeficienteCopropiedad(),
                torre);

        apartamentoRepository.save(apartamento);
        return ApartamentoDTO.de(apartamento);
    }

    @Override
    @Transactional(readOnly = true)
    public ApartamentoDTO obtener(Long id) {
        Apartamento apartamento = apartamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el apartamento con id " + id));
        return ApartamentoDTO.de(apartamento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApartamentoDTO> listar() {
        return apartamentoRepository.findAll().stream()
                .map(ApartamentoDTO::de)
                .toList();
    }
}
