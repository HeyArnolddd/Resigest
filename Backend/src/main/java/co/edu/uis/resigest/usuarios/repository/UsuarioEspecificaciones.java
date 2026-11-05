package co.edu.uis.resigest.usuarios.repository;

import co.edu.uis.resigest.usuarios.domain.Administrador;
import co.edu.uis.resigest.usuarios.domain.Portero;
import co.edu.uis.resigest.usuarios.domain.Residente;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.domain.TecnicoMantenimiento;
import co.edu.uis.resigest.usuarios.domain.Usuario;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Filtros del listado de usuarios. Con herencia JOINED el rol no es una
 * columna, así que se filtra por la subclase concreta.
 */
public final class UsuarioEspecificaciones {

    private UsuarioEspecificaciones() {
    }

    /**
     * @param rol    rol exacto, o null para todos
     * @param texto  busca en nombre, correo y documento (sin distinguir mayúsculas), o null
     * @param activo estado de la cuenta, o null para ambos
     */
    public static Specification<Usuario> filtrar(Rol rol, String texto, Boolean activo) {
        return (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();
            if (rol != null) {
                condiciones.add(cb.equal(root.type(), claseDe(rol)));
            }
            if (texto != null && !texto.isBlank()) {
                String patron = "%" + texto.trim().toLowerCase() + "%";
                condiciones.add(cb.or(
                        cb.like(cb.lower(root.get("nombreCompleto")), patron),
                        cb.like(cb.lower(root.get("correo")), patron),
                        cb.like(cb.lower(root.get("documento")), patron)));
            }
            if (activo != null) {
                condiciones.add(cb.equal(root.get("activo"), activo));
            }
            return cb.and(condiciones.toArray(Predicate[]::new));
        };
    }

    private static Class<? extends Usuario> claseDe(Rol rol) {
        return switch (rol) {
            case RESIDENTE -> Residente.class;
            case ADMINISTRADOR -> Administrador.class;
            case PORTERO -> Portero.class;
            case MANTENIMIENTO -> TecnicoMantenimiento.class;
        };
    }
}
