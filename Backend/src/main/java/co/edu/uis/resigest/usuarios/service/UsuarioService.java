package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.dto.ActualizarUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.CrearUsuarioRequest;
import co.edu.uis.resigest.usuarios.dto.CredencialesDTO;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Contrato del caso de uso de gestión de usuarios (CU05).
 */
public interface UsuarioService {

    UsuarioDTO registrar(CrearUsuarioRequest request);

    UsuarioDTO obtener(Long id);

    Page<UsuarioDTO> listar(Rol rol, String texto, Boolean activo, Pageable pageable);

    UsuarioDTO actualizar(Long id, ActualizarUsuarioRequest request);

    void activar(Long id);

    /** {@code solicitanteId}: un administrador no puede desactivarse a sí mismo. */
    void desactivar(Long id, Long solicitanteId);

    /** Borra la cuenta. Si ya tiene historial (pagos, ingresos…) responde conflicto: se debe desactivar. */
    void eliminar(Long id, Long solicitanteId);

    void cambiarContrasena(Long id, String contrasena);

    /** Solo para portería y mantenimiento. */
    CredencialesDTO credenciales(Long id);
}
