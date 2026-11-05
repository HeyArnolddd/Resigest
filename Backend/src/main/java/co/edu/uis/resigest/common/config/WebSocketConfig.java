package co.edu.uis.resigest.common.config;

import co.edu.uis.resigest.common.security.JwtService;
import co.edu.uis.resigest.common.security.UsuarioAutenticado;
import co.edu.uis.resigest.common.security.UsuarioDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * Configuración de WebSocket con STOMP para el chat en tiempo real.
 * El cliente se conecta a /ws enviando el JWT en el header STOMP {@code Authorization}
 * y solo puede suscribirse a su propio canal /topic/chat/{usuarioId}.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String PREFIJO_CANAL = "/topic/chat/";

    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;
    private final String[] origenes;

    public WebSocketConfig(JwtService jwtService, UsuarioDetailsService usuarioDetailsService,
                           @Value("${app.cors.origins:http://localhost:5173}") List<String> origenes) {
        this.jwtService = jwtService;
        this.usuarioDetailsService = usuarioDetailsService;
        this.origenes = origenes.toArray(new String[0]);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins(origenes);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null || accessor.getCommand() == null) {
                    return message;
                }
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    accessor.setUser(autenticar(accessor.getFirstNativeHeader("Authorization")));
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())
                        || StompCommand.SEND.equals(accessor.getCommand())) {
                    if (!(accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth)
                            || !(auth.getPrincipal() instanceof UsuarioAutenticado usuario)) {
                        throw new MessagingException("No autenticado");
                    }
                    String destino = accessor.getDestination();
                    if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())
                            && (destino == null || !destino.equals(PREFIJO_CANAL + usuario.getId()))) {
                        throw new MessagingException("Suscripción no permitida");
                    }
                }
                return message;
            }
        });
    }

    private UsernamePasswordAuthenticationToken autenticar(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            throw new MessagingException("Token requerido");
        }
        String token = header.substring(7);
        if (!jwtService.esValido(token)) {
            throw new MessagingException("Token inválido");
        }
        UsuarioAutenticado usuario = (UsuarioAutenticado)
                usuarioDetailsService.loadUserByUsername(jwtService.extraerCorreo(token));
        return new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
    }
}
