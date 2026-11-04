package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Contrato del caso de uso de gestión de usuarios (CU05).
 */
public interface UsuarioService {

    UsuarioDTO registrar(CrearUsuarioRequest request);

    UsuarioDTO obtener(Long id);

    Page<UsuarioDTO> listar(Pageable pageable);

    void desactivar(Long id);
}
