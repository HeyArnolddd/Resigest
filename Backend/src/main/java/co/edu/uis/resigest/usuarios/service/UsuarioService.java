package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;

import java.util.List;

/**
 * Contrato del caso de uso de gestión de usuarios (CU05).
 */
public interface UsuarioService {

    UsuarioDTO registrar(CrearUsuarioRequest request);

    UsuarioDTO obtener(Long id);

    List<UsuarioDTO> listar(Rol rol);

    void desactivar(Long id);
}
