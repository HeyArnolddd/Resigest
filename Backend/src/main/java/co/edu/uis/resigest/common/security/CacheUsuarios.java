package co.edu.uis.resigest.common.security;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Recuerda por unos segundos al usuario autenticado de cada token para no consultarlo en la
 * base de datos en cada petición (con la BD remota cada consulta cuesta ~150 ms).
 * Se vacía al editar, activar, desactivar, eliminar o cambiar la contraseña de un usuario,
 * así esos cambios aplican de inmediato.
 */
@Component
public class CacheUsuarios {

    private static final Duration VIGENCIA = Duration.ofSeconds(20);

    private record Entrada(UsuarioAutenticado usuario, long expira) {
    }

    private final Map<String, Entrada> entradas = new ConcurrentHashMap<>();

    public UsuarioAutenticado obtener(String correo, Supplier<UsuarioAutenticado> cargar) {
        long ahora = System.currentTimeMillis();
        Entrada entrada = entradas.get(correo);
        if (entrada != null && entrada.expira() > ahora) {
            return entrada.usuario();
        }
        UsuarioAutenticado usuario = cargar.get();
        entradas.put(correo, new Entrada(usuario, ahora + VIGENCIA.toMillis()));
        return usuario;
    }

    /** Olvida a todos; si hay una transacción en curso, después de confirmarla. */
    public void invalidar() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    entradas.clear();
                }
            });
        } else {
            entradas.clear();
        }
    }
}
