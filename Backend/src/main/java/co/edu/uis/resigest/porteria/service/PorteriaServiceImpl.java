package co.edu.uis.resigest.porteria.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.porteria.domain.RegistroIngreso;
import co.edu.uis.resigest.porteria.dto.RegistrarIngresoRequest;
import co.edu.uis.resigest.porteria.dto.RegistroIngresoDTO;
import co.edu.uis.resigest.porteria.repository.RegistroIngresoRepository;
import co.edu.uis.resigest.usuarios.domain.Portero;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Lógica de portería: registrar ingresos (CU04), salidas y consultar bitácora.
 */
@Service
public class PorteriaServiceImpl implements PorteriaService {

    private final RegistroIngresoRepository registroIngresoRepository;
    private final ApartamentoRepository apartamentoRepository;
    private final UsuarioRepository usuarioRepository;

    public PorteriaServiceImpl(RegistroIngresoRepository registroIngresoRepository,
                               ApartamentoRepository apartamentoRepository,
                               UsuarioRepository usuarioRepository) {
        this.registroIngresoRepository = registroIngresoRepository;
        this.apartamentoRepository = apartamentoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public RegistroIngresoDTO registrarIngreso(RegistrarIngresoRequest request, Long porteroId) {
        Usuario usuario = usuarioRepository.findById(porteroId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + porteroId));
        if (!(usuario instanceof Portero portero)) {
            throw new ReglaNegocioException("El usuario no es un portero");
        }

        Apartamento apartamento = apartamentoRepository.findById(request.apartamentoDestinoId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el apartamento con id " + request.apartamentoDestinoId()));

        RegistroIngreso registro = new RegistroIngreso(
                request.nombreVisitante(), request.documento(), request.tipo(),
                request.empresa(), apartamento, portero);
        registroIngresoRepository.save(registro);
        return RegistroIngresoDTO.de(registro);
    }

    @Override
    @Transactional
    public void registrarSalida(Long id) {
        RegistroIngreso registro = buscarRegistro(id);
        registro.registrarSalida();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistroIngresoDTO> consultarBitacora(LocalDate desde, LocalDate hasta) {
        return registroIngresoRepository
                .findByFechaIngresoBetween(desde.atStartOfDay(), hasta.plusDays(1).atStartOfDay())
                .stream()
                .map(RegistroIngresoDTO::de)
                .toList();
    }

    private RegistroIngreso buscarRegistro(Long id) {
        return registroIngresoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el registro con id " + id));
    }
}
