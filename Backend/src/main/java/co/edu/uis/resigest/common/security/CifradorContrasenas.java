package co.edu.uis.resigest.common.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Cifra y descifra (AES-256-GCM) la contraseña del personal operativo para que
 * el administrador pueda consultarla. El login sigue validando contra el hash
 * BCrypt; esta copia solo se usa para mostrarla al administrador.
 *
 * La clave se deriva con SHA-256 de {@code app.credenciales.clave}. En producción
 * debe venir de una variable de entorno: si cambia, las copias guardadas dejan de
 * poder descifrarse (y basta con restablecer la contraseña).
 */
@Component
public class CifradorContrasenas {

    private static final String ALGORITMO = "AES/GCM/NoPadding";
    private static final int LONGITUD_IV = 12;
    private static final int LONGITUD_TAG_BITS = 128;

    private final SecretKeySpec clave;
    private final SecureRandom aleatorio = new SecureRandom();

    public CifradorContrasenas(@Value("${app.credenciales.clave}") String secreto) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(secreto.getBytes(StandardCharsets.UTF_8));
            this.clave = new SecretKeySpec(bytes, "AES");
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("No se pudo preparar la clave de credenciales", e);
        }
    }

    public String cifrar(String texto) {
        try {
            byte[] iv = new byte[LONGITUD_IV];
            aleatorio.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.ENCRYPT_MODE, clave, new GCMParameterSpec(LONGITUD_TAG_BITS, iv));
            byte[] cifrado = cipher.doFinal(texto.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(
                    ByteBuffer.allocate(iv.length + cifrado.length).put(iv).put(cifrado).array());
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("No se pudo cifrar la contraseña", e);
        }
    }

    /** Devuelve null si el valor no se puede descifrar (por ejemplo, si cambió la clave). */
    public String descifrar(String valor) {
        try {
            byte[] datos = Base64.getDecoder().decode(valor);
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.DECRYPT_MODE, clave,
                    new GCMParameterSpec(LONGITUD_TAG_BITS, datos, 0, LONGITUD_IV));
            byte[] texto = cipher.doFinal(datos, LONGITUD_IV, datos.length - LONGITUD_IV);
            return new String(texto, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            return null;
        }
    }
}
