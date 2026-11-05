-- V20: confirmación de incidencias por parte del residente y ajuste de las zonas comunes.

-- El técnico adjunta una foto al resolver; el residente confirma o la reabre con un comentario.
ALTER TABLE incidencia ADD COLUMN foto_solucion_url VARCHAR(300);
ALTER TABLE incidencia ADD COLUMN observacion_confirmacion VARCHAR(500);

-- Zonas comunes: la cancha de los datos de ejemplo se reemplaza por la piscina.
-- Si la cancha ya tiene reservas no se puede borrar, así que solo se deshabilita.
DELETE FROM zona_comun z
WHERE z.nombre = 'Cancha'
  AND NOT EXISTS (SELECT 1 FROM reserva r WHERE r.zona_comun_id = z.id);
UPDATE zona_comun SET activa = FALSE WHERE nombre = 'Cancha';

INSERT INTO zona_comun (nombre, descripcion, capacidad, activa, fecha_creacion, fecha_actualizacion)
SELECT 'Piscina', 'Piscina de adultos y chapoteadero', 40, TRUE, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM zona_comun WHERE nombre = 'Piscina');
