package co.edu.uis.resigest.common.security;

import co.edu.uis.resigest.common.exception.AccesoDenegadoException;
import co.edu.uis.resigest.usuarios.domain.Rol;
import co.edu.uis.resigest.usuarios.repository.ResidenteRepository;
import org.springframework.stereotype.Component;

/**
 * Componente reutilizable que verifica que el usuario autenticado tiene permiso
 * sobre un apartamento: el administrador siempre puede; el residente solo sobre
 * el suyo. Evita que un residente consulte el apartamento de otro cambiando el id.
 */
@Component
public class VerificadorPropietario {

    private final ResidenteRepository residenteRepository;

    public VerificadorPropietario(ResidenteRepository residenteRepository) {
        this.residenteRepository = residenteRepository;
    }

    public void verificarApartamento(Long apartamentoId, UsuarioAutenticado autenticado) {
        if (autenticado.getRol() == Rol.ADMINISTRADOR) {
            return;
        }
        if (autenticado.getRol() == Rol.RESIDENTE
                && residenteRepository.findByIdAndApartamentoId(autenticado.getId(), apartamentoId).isPresent()) {
            return;
        }
        throw new AccesoDenegadoException("No tienes permiso sobre este apartamento");
    }
}
