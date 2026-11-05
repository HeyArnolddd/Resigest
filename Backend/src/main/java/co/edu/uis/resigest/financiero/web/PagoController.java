package co.edu.uis.resigest.financiero.web;

import co.edu.uis.resigest.financiero.dto.IniciarPagoRequest;
import co.edu.uis.resigest.financiero.dto.PagoDTO;
import co.edu.uis.resigest.financiero.dto.ReportarPagoManualRequest;
import co.edu.uis.resigest.financiero.dto.ValidarPagoRequest;
import co.edu.uis.resigest.financiero.service.ComprobanteService;
import co.edu.uis.resigest.financiero.service.PagoService;
import jakarta.validation.Valid;
import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.common.security.VerificadorPropietario;
import co.edu.uis.resigest.financiero.domain.EstadoPago;
import co.edu.uis.resigest.usuarios.domain.Rol;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

/**
 * Endpoints de pagos (RF02 parte 2 · CU02, CU06).
 */
@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;
    private final ComprobanteService comprobanteService;

    private final VerificadorPropietario verificadorPropietario;

    public PagoController(PagoService pagoService, ComprobanteService comprobanteService,
                          VerificadorPropietario verificadorPropietario) {
        this.verificadorPropietario = verificadorPropietario;
        this.pagoService = pagoService;
        this.comprobanteService = comprobanteService;
    }

    @PostMapping("/pasarela")
    @PreAuthorize("hasRole('RESIDENTE')")
    public ResponseEntity<PagoDTO> pagarPasarela(@Valid @RequestBody IniciarPagoRequest request) {
        return ResponseEntity.ok(pagoService.iniciarPagoPasarela(request));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasRole('RESIDENTE')")
    public ResponseEntity<PagoDTO> reportarManual(@Valid @RequestBody ReportarPagoManualRequest request) {
        PagoDTO pago = pagoService.reportarPagoManual(request);
        return ResponseEntity.created(URI.create("/api/pagos/" + pago.id()))
                .body(pago);
    }

    /** Admin: cualquier filtro. Residente: debe indicar su apartamentoId (se verifica la propiedad). */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RESIDENTE')")
    public List<PagoDTO> listar(@RequestParam(required = false) EstadoPago estado,
                                @RequestParam(required = false) Long apartamentoId,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        if (autenticado.getRol() == Rol.RESIDENTE) {
            if (apartamentoId == null) {
                throw new ReglaNegocioException("Debes indicar apartamentoId");
            }
            verificadorPropietario.verificarApartamento(apartamentoId, autenticado);
        }
        return pagoService.listar(estado, apartamentoId, desde, hasta);
    }

    @GetMapping("/pendientes-validacion")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<PagoDTO> pendientesValidacion() {
        return pagoService.listarPendientesValidacion();
    }

    @PatchMapping("/{id}/validacion")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PagoDTO> validar(@PathVariable Long id,
                                           @Valid @RequestBody ValidarPagoRequest request) {
        return ResponseEntity.ok(pagoService.validarPago(id, request));
    }

    @GetMapping("/{id}/comprobante")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RESIDENTE')")
    public ResponseEntity<byte[]> comprobante(@PathVariable Long id) {
        byte[] pdf = comprobanteService.generar(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
