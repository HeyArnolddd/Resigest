package co.edu.uis.resigest.common.security;

import co.edu.uis.resigest.usuarios.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Carga un usuario por correo para Spring Security y lo adapta a UserDetails.
 */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final CacheUsuarios cacheUsuarios;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository, CacheUsuarios cacheUsuarios) {
        this.usuarioRepository = usuarioRepository;
        this.cacheUsuarios = cacheUsuarios;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        return cacheUsuarios.obtener(correo, () -> new UsuarioAutenticado(usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correo))));
    }
}
