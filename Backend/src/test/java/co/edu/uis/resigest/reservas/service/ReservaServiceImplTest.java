package co.edu.uis.resigest.reservas.service;

import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.domain.Torre;
import co.edu.uis.resigest.reservas.domain.Reserva;
import co.edu.uis.resigest.reservas.domain.ZonaComun;
import co.edu.uis.resigest.reservas.dto.ReservaDTO;
import co.edu.uis.resigest.reservas.repository.ReservaRepository;
import co.edu.uis.resigest.reservas.repository.ZonaComunRepository;
import co.edu.uis.resigest.usuarios.repository.ResidenteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.context.ApplicationEventPublisher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservaServiceImplTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private ZonaComunRepository zonaComunRepository;

    @Mock
    private ResidenteRepository residenteRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private ReservaServiceImpl reservaService;

    @BeforeEach
    void setUp() {
        reservaService = new ReservaServiceImpl(
                reservaRepository, zonaComunRepository, residenteRepository, List.of(), eventPublisher);
    }

    @Test
    void aprobarPasaReservaAAprobada() {
        ZonaComun zona = new ZonaComun("BBQ", "Zona BBQ", 10);
        Torre torre = new Torre("1", 5);
        Apartamento apartamento = new Apartamento("101", 1, new BigDecimal("50.0000"), torre);
        Reserva reserva = new Reserva(zona, apartamento,
                LocalDateTime.of(2026, 10, 10, 14, 0),
                LocalDateTime.of(2026, 10, 10, 18, 0));

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));

        ReservaDTO dto = reservaService.aprobar(1L);

        assertThat(dto.estado()).isEqualTo("APROBADA");
    }
}
