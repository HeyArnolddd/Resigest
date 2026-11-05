package co.edu.uis.resigest.usuarios.mapper;

import org.hibernate.Hibernate;
import co.edu.uis.resigest.usuarios.dto.DirectorioDTO;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.usuarios.domain.Portero;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import co.edu.uis.resigest.usuarios.dto.UsuarioDTO;

/**
 * Convierte una entidad {@link Usuario} en su DTO de salida, con los datos
 * propios de cada rol. Debe llamarse dentro de una transacción (el apartamento
 * del residente se carga de forma perezosa).
 */
public final class UsuarioMapper {

    private UsuarioMapper() {
    }

    public static UsuarioDTO toDto(Usuario usuario) {
        Residente residente = usuario instanceof Residente r ? r : null;
        Apartamento apartamento = residente != null ? residente.getApartamento() : null;
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getCorreo(),
                usuario.getDocumento(),
                usuario.getTelefono(),
                usuario.isActivo(),
                usuario.getRol(),
                residente != null ? residente.getTipo() : null,
                apartamento != null ? apartamento.getId() : null,
                apartamento != null ? apartamento.identificadorCompleto() : null,
                usuario instanceof Portero p ? p.getTurno() : null,
                usuario instanceof TecnicoMantenimiento t ? t.getEspecialidad() : null,
                usuario.getFechaCreacion()
        );
    }

    /** Entrada pública del directorio. Acepta proxies de Hibernate (relaciones LAZY). */
    public static DirectorioDTO aDirectorio(Usuario usuario) {
        Usuario real = (Usuario) Hibernate.unproxy(usuario);
        String detalle;
        if (real instanceof Residente r) {
            detalle = r.getApartamento().identificadorCompleto();
        } else if (real instanceof Portero p) {
            detalle = p.getTurno() != null ? "Portería · turno " + p.getTurno().toLowerCase() : "Portería";
        } else if (real instanceof TecnicoMantenimiento t) {
            detalle = t.getEspecialidad() != null ? "Mantenimiento · " + t.getEspecialidad() : "Mantenimiento";
        } else {
            detalle = "Administración";
        }
        // El teléfono de los residentes es privado
        String telefono = real instanceof Residente ? null : real.getTelefono();
        return new DirectorioDTO(real.getId(), real.getNombreCompleto(), real.getRol(), detalle, telefono);
    }
}
