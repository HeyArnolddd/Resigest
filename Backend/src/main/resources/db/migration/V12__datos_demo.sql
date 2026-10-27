-- V12: datos de demostración para el recorrido completo.
-- Pensado para una base limpia: docker compose down -v && docker compose up -d

-- Torres
INSERT INTO torre (nombre, numero_pisos, fecha_creacion, fecha_actualizacion) VALUES
('1', 5, now(), now()),
('2', 5, now(), now());

-- Apartamentos: 10 en total, coeficiente 10% cada uno (suman 100%)
INSERT INTO apartamento (numero, piso, coeficiente_copropiedad, activo, torre_id, fecha_creacion, fecha_actualizacion)
SELECT v.numero, v.piso, 10.0000, TRUE, t.id, now(), now()
FROM (VALUES ('101',1),('102',1),('103',2),('104',2),('105',3)) AS v(numero, piso)
JOIN torre t ON t.nombre = '1';

INSERT INTO apartamento (numero, piso, coeficiente_copropiedad, activo, torre_id, fecha_creacion, fecha_actualizacion)
SELECT v.numero, v.piso, 10.0000, TRUE, t.id, now(), now()
FROM (VALUES ('201',1),('202',1),('203',2),('204',2),('205',3)) AS v(numero, piso)
JOIN torre t ON t.nombre = '2';

-- Zonas comunes
INSERT INTO zona_comun (nombre, descripcion, capacidad, activa, fecha_creacion, fecha_actualizacion) VALUES
('BBQ', 'Zona de parrilla', 10, TRUE, now(), now()),
('Salón Social', 'Salón para eventos', 30, TRUE, now(), now()),
('Cancha', 'Cancha deportiva', 20, TRUE, now(), now());

-- Usuarios demo (contraseña: admin123)
INSERT INTO usuario (nombre_completo, correo, contrasena_hash, documento, activo, intentos_fallidos, fecha_creacion, fecha_actualizacion) VALUES
('Residente Demo', 'residente@resigest.com', '$2a$10$oPUWLw1gzT2cRPW2hrk0POuwQu./Hb2wiorGMxMuUbBLHzG.EEGde', '1000000002', TRUE, 0, now(), now()),
('Portero Demo', 'portero@resigest.com', '$2a$10$oPUWLw1gzT2cRPW2hrk0POuwQu./Hb2wiorGMxMuUbBLHzG.EEGde', '1000000003', TRUE, 0, now(), now()),
('Tecnico Demo', 'tecnico@resigest.com', '$2a$10$oPUWLw1gzT2cRPW2hrk0POuwQu./Hb2wiorGMxMuUbBLHzG.EEGde', '1000000004', TRUE, 0, now(), now());

-- Residente asociado al apartamento 101 de la torre 1
INSERT INTO residente (id, tipo_residente, apartamento_id)
SELECT u.id, 'PROPIETARIO', a.id
FROM usuario u
JOIN apartamento a ON a.numero = '101'
WHERE u.correo = 'residente@resigest.com';

-- Portero
INSERT INTO portero (id, turno)
SELECT id, 'mañana' FROM usuario WHERE correo = 'portero@resigest.com';

-- Técnico de mantenimiento
INSERT INTO tecnico_mantenimiento (id, especialidad)
SELECT id, 'plomería' FROM usuario WHERE correo = 'tecnico@resigest.com';
