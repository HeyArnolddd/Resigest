package co.edu.uis.resigest.comunicaciones.web;

import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.comunicaciones.dto.ChatMensajeRequest;
import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;
import co.edu.uis.resigest.comunicaciones.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Chat entre usuarios (mensajería persistente + historial).
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<MensajeChatDTO> enviar(@Valid @RequestBody ChatMensajeRequest request,
                                                 @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return ResponseEntity.ok(chatService.enviar(
                autenticado.getId(), request.destinatarioId(), request.contenido()));
    }

    @GetMapping
    public List<MensajeChatDTO> conversacion(@RequestParam Long conUsuarioId,
                                             @AuthenticationPrincipal UsuarioAutenticado autenticado) {
        return chatService.conversacion(autenticado.getId(), conUsuarioId);
    }
}
