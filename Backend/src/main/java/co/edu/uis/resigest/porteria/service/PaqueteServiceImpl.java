package co.edu.uis.resigest.porteria.service;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.common.archivos.ArchivoService;
import co.edu.uis.resigest.porteria.event.PaqueteRecibidoEvento;
import org.springframework.context.ApplicationEventPublisher;
import co.edu.uis.resigest.common.exception.RecursoNoEncontradoException;
import co.edu.uis.resigest.inmueble.domain.Apartamento;
import co.edu.uis.resigest.inmueble.repository.ApartamentoRepository;
import co.edu.uis.resigest.porteria.domain.Paquete;
import co.edu.uis.resigest.porteria.dto.EntregaPaqueteRequest;
import co.edu.uis.resigest.porteria.dto.PaqueteDTO;
import co.edu.uis.resigest.porteria.dto.RegistrarPaqueteRequest;
import co.edu.uis.resigest.porteria.repository.PaqueteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica de paquetería: recibir, entregar y listar.
 */
@Service
public class PaqueteServiceImpl implements PaqueteService {

    private final PaqueteRepository paqueteRepository;
    private final ApartamentoRepository apartamentoRepository;

    private final ApplicationEventPublisher eventPublisher;

    public PaqueteServiceImpl(PaqueteRepository paqueteRepository,
                              ApartamentoRepository apartamentoRepository,
                              ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
        this.paqueteRepository = paqueteRepository;
        this.apartamentoRepository = apartamentoRepository;
    }

    @Override
    @Transactional
    public PaqueteDTO registrar(RegistrarPaqueteRequest request) {
        Apartamento apartamento = apartamentoRepository.findById(request.apartamentoDestinoId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el apartamento con id " + request.apartamentoDestinoId()));

        Paquete paquete = new Paquete(
                apartamento, request.empresaTransportadora(), request.descripcion());
        paquete.setGuia(request.guia());
        paquete.setTamano(request.tamano());
        if (request.fotoUrl() != null && !request.fotoUrl().isBlank()) {
            if (!ArchivoService.esUrlPropia(request.fotoUrl())) {
                throw new ReglaNegocioException("La foto debe subirse primero al sistema");
            }
            paquete.setFotoUrl(request.fotoUrl());
        }
        paqueteRepository.save(paquete);
        eventPublisher.publishEvent(new PaqueteRecibidoEvento(apartamento.getId(), request.empresaTransportadora()));
        return PaqueteDTO.de(paquete);
    }

    @Override
    @Transactional
    public PaqueteDTO confirmarRecogido(Long id, String nombreResidente) {
        Paquete paquete = buscarPaquete(id);
        paquete.entregarA(nombreResidente);
        return PaqueteDTO.de(paquete);
    }

    @Override
    @Transactional(readOnly = true)
    public Long apartamentoDe(Long id) {
        return buscarPaquete(id).getApartamentoDestino().getId();
    }

    @Override
    @Transactional
    public PaqueteDTO entregar(Long id, EntregaPaqueteRequest request) {
        Paquete paquete = buscarPaquete(id);
        paquete.entregarA(request.entregadoA());
        return PaqueteDTO.de(paquete);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaqueteDTO> listar(Long apartamentoId) {
        List<Paquete> paquetes = apartamentoId == null
                ? paqueteRepository.findAllByOrderByFechaRecepcionDesc()
                : paqueteRepository.findByApartamentoDestinoIdOrderByFechaRecepcionDesc(apartamentoId);
        return paquetes.stream()
                .map(PaqueteDTO::de)
                .toList();
    }

    private Paquete buscarPaquete(Long id) {
        return paqueteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe el paquete con id " + id));
    }
}
