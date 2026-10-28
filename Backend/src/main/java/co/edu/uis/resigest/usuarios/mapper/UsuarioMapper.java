package co.edu.uis.resigest.usuarios.mapper;

import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;

/**
 * Convierte una entidad {@link Usuario} en su DTO de salida.
 */
public final class UsuarioMapper {

    private UsuarioMapper() {
    }

    public static UsuarioDTO toDto(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                usuario.getDocumento(),
                usuario.getTelefono(),
                usuario.isActivo(),
                usuario.getRol()
        );
    }
}
