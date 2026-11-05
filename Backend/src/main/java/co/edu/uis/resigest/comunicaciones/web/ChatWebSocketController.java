package co.edu.uis.resigest.comunicaciones.web;

import co.edu.uis.resigest.comunicaciones.dto.ChatWebSocketMensaje;
import co.edu.uis.resigest.comunicaciones.dto.MensajeChatDTO;
import co.edu.uis.resigest.comunicaciones.service.ChatService;
import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Recibe mensajes de chat por STOMP (/app/chat.enviar), los persiste y los
 * reenvía en tiempo real al destinatario en /topic/chat/{destinatarioId}.
 */
@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.enviar")
    public void enviar(ChatWebSocketMensaje mensaje, Principal principal) {
        // El remitente sale del token, nunca del cuerpo del mensaje (evita suplantación).
        Long remitenteId = ((UsuarioAutenticado) ((UsernamePasswordAuthenticationToken) principal)
                .getPrincipal()).getId();
        MensajeChatDTO dto = chatService.enviar(
                remitenteId, mensaje.destinatarioId(), mensaje.contenido());
        messagingTemplate.convertAndSend("/topic/chat/" + mensaje.destinatarioId(), dto);
    }
}
