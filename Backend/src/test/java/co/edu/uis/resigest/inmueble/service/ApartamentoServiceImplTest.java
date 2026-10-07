package co.edu.uis.resigest.inmueble.service;

import co.edu.uis.resigest.common.exception.ConflictoException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import co.edu.uis.resigest.inmueble.dto.ApartamentoDTO;
import co.edu.uis.resigest.inmueble.dto.CrearApartamentoRequest;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.inmueble.repository.TorreRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApartamentoServiceImplTest {

    @Mock
    private ApartamentoRepository apartamentoRepository;

    @Mock
    private TorreRepository torreRepository;

    @InjectMocks
    private ApartamentoServiceImpl apartamentoService;

    @Test
    void crearGuardaApartamentoCuandoTorreExisteYNoHayDuplicado() {
        Torre torre = new Torre("1", 5);
        CrearApartamentoRequest request = new CrearApartamentoRequest(
                1L, "101", 1, new BigDecimal("10.0000"));

        when(torreRepository.findById(1L)).thenReturn(Optional.of(torre));
        when(apartamentoRepository.findByTorreIdAndNumero(1L, "101")).thenReturn(Optional.empty());

        ApartamentoDTO dto = apartamentoService.crear(request);

        assertThat(dto.numero()).isEqualTo("101");
        assertThat(dto.torreNombre()).isEqualTo("1");
        verify(apartamentoRepository).save(any(Apartamento.class));
    }

    @Test
    void crearLanzaConflictoCuandoYaExisteNumeroEnLaTorre() {
        Torre torre = new Torre("1", 5);
        Apartamento existente = new Apartamento("101", 1, new BigDecimal("10.0000"), torre);
        CrearApartamentoRequest request = new CrearApartamentoRequest(
                1L, "101", 1, new BigDecimal("10.0000"));

        when(torreRepository.findById(1L)).thenReturn(Optional.of(torre));
        when(apartamentoRepository.findByTorreIdAndNumero(1L, "101"))
                .thenReturn(Optional.of(existente));

        assertThatThrownBy(() -> apartamentoService.crear(request))
                .isInstanceOf(ConflictoException.class);
    }
}
