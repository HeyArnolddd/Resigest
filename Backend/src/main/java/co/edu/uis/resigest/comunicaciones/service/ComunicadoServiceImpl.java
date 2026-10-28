package co.edu.uis.resigest.comunicaciones.service;

import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.comunicaciones.domain.Comunicado;
import co.edu.uis.resigest.comunicaciones.dto.ComunicadoDTO;
import co.edu.uis.resigest.comunicaciones.dto.CrearComunicadoRequest;
import co.edu.uis.resigest.comunicaciones.repository.ComunicadoRepository;
import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica de comunicados oficiales (CU12).
 */
@Service
public class ComunicadoServiceImpl implements ComunicadoService {

    private final ComunicadoRepository comunicadoRepository;
    private final UsuarioRepository usuarioRepository;

    public ComunicadoServiceImpl(ComunicadoRepository comunicadoRepository,
                                 UsuarioRepository usuarioRepository) {
        this.comunicadoRepository = comunicadoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public ComunicadoDTO publicar(CrearComunicadoRequest request, Long autorId) {
        Usuario usuario = usuarioRepository.findById(autorId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el usuario con id " + autorId));
        if (!(usuario instanceof Administrador administrador)) {
            throw new ReglaNegocioException("El usuario no es un administrador");
        }

        Comunicado comunicado = new Comunicado(
                request.titulo(), request.cuerpo(), request.urlAdjunto(), administrador);
        comunicadoRepository.save(comunicado);
        return ComunicadoDTO.de(comunicado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComunicadoDTO> listar(boolean soloFijados) {
        List<Comunicado> comunicados = soloFijados
                ? comunicadoRepository.findByFijadoTrue()
                : comunicadoRepository.findAll();
        return comunicados.stream().map(ComunicadoDTO::de).toList();
    }
}
