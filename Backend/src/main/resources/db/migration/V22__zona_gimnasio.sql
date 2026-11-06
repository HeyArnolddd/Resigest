-- V22: vuelve el gimnasio a las zonas comunes reservables.
-- Si existía deshabilitado se reactiva; si no existe, se crea.
UPDATE zona_comun SET activa = TRUE, fecha_actualizacion = now() WHERE nombre = 'Gimnasio';

INSERT INTO zona_comun (nombre, descripcion, capacidad, activa, fecha_creacion, fecha_actualizacion)
SELECT 'Gimnasio', 'Gimnasio con máquinas y zona de pesas', 15, TRUE, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM zona_comun WHERE nombre = 'Gimnasio');
