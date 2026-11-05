package co.edu.uis.resigest.common.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CifradorContrasenasTest {

    private final CifradorContrasenas cifrador = new CifradorContrasenas("clave-de-prueba");

    @Test
    void descifrarDevuelveElTextoOriginal() {
        String cifrada = cifrador.cifrar("Portero#2026");

        assertThat(cifrada).doesNotContain("Portero");
        assertThat(cifrador.descifrar(cifrada)).isEqualTo("Portero#2026");
    }

    @Test
    void cadaCifradoUsaUnIvDistinto() {
        assertThat(cifrador.cifrar("igual")).isNotEqualTo(cifrador.cifrar("igual"));
    }

    @Test
    void conOtraClaveNoSePuedeDescifrar() {
        String cifrada = cifrador.cifrar("secreto");

        assertThat(new CifradorContrasenas("otra-clave").descifrar(cifrada)).isNull();
        assertThat(cifrador.descifrar("no-es-base64-valido!")).isNull();
    }
}
