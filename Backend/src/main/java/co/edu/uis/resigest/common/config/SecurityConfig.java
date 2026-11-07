package co.edu.uis.resigest.common.config;

import co.edu.uis.resigest.common.security.JwtAuthenticationFilter;
import co.edu.uis.resigest.common.security.JwtService;
import co.edu.uis.resigest.common.security.UsuarioDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Seguridad JWT sin estado: el login es público, todo lo demás exige token.
 * Los permisos por rol se aplican con {@code @PreAuthorize} en los controladores.
 * CORS solo admite los orígenes de {@code app.cors.origenes} (separados por coma).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;
    private final List<String> origenesPermitidos;

    public SecurityConfig(JwtService jwtService, UsuarioDetailsService usuarioDetailsService,
                          @Value("${app.cors.origenes}") String origenes) {
        this.jwtService = jwtService;
        this.usuarioDetailsService = usuarioDetailsService;
        this.origenesPermitidos = Arrays.stream(origenes.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .toList();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/pagos/en-linea/confirmacion", "/api/salud",
                                "/swagger-ui/**", "/v3/api-docs/**", "/ws", "/ws/**").permitAll()
                        .anyRequest().authenticated())
                // Sin token (o con uno vencido o inválido) es 401, no 403: 403 queda para "sin permiso"
                .exceptionHandling(ex -> ex.authenticationEntryPoint(noAutenticado()))
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Se aceptan patrones (p. ej. https://resigest-*.onrender.com) para las URL que asigna Render
        config.setAllowedOriginPatterns(origenesPermitidos);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /** Responde 401 con el mismo formato ApiError que el resto de errores. */
    private AuthenticationEntryPoint noAutenticado() {
        return (request, response, authException) -> {
            response.setStatus(401);
            response.setContentType("application/json");
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("{\"timestamp\":\"" + LocalDateTime.now()
                    + "\",\"estado\":401,\"codigo\":\"NO_AUTENTICADO\","
                    + "\"mensaje\":\"Debes iniciar sesión para continuar\",\"erroresCampo\":{}}");
        };
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService, usuarioDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
