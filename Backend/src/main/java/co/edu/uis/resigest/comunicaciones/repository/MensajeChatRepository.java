package co.edu.uis.resigest.comunicaciones.repository;

import co.edu.uis.resigest.comunicaciones.domain.MensajeChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensajeChatRepository extends JpaRepository<MensajeChat, Long> {

    @Query("""
            select m from MensajeChat m
            where (m.remitente.id = :u1 and m.destinatario.id = :u2)
               or (m.remitente.id = :u2 and m.destinatario.id = :u1)
            order by m.fecha
            """)
    List<MensajeChat> conversacion(@Param("u1") Long u1, @Param("u2") Long u2);
}
