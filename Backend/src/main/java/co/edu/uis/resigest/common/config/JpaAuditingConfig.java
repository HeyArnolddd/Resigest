package co.edu.uis.resigest.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Activa la auditoría automática de JPA para que los campos
 * {@code @CreatedDate} y {@code @LastModifiedDate} de {@code EntidadBase}
 * se rellenen solos al guardar y al actualizar una entidad.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
