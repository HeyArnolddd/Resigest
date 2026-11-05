package co.edu.uis.resigest.usuarios.mapper;

import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.ResidenteInfoDTO;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;

import java.util.function.LongPredicate;

/**
 * Convierte una entidad {@link Usuario} en su DTO de salida.
 */
public final class UsuarioMapper {

    private UsuarioMapper() {
    }

    /** Debe llamarse dentro de una transacción: accede al apartamento (LAZY). */
    public static UsuarioDTO toDto(Usuario usuario) {
        return toDto(usuario, null);
    }

    /** {@code enMora} decide si un apartamento tiene cartera vencida; si es null, {@code alDia} queda sin informar. */
    public static UsuarioDTO toDto(Usuario usuario, LongPredicate enMora) {
        ResidenteInfoDTO residente = null;
        if (usuario instanceof Residente r) {
            residente = new ResidenteInfoDTO(r.getTipo(), r.getApartamento().getId(),
                    r.getApartamento().identificadorCompleto(),
                    enMora == null ? null : !enMora.test(r.getApartamento().getId()));
        }
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                usuario.getDocumento(),
                usuario.getTelefono(),
                usuario.isActivo(),
                usuario.getRol(),
                residente
        );
    }
}
