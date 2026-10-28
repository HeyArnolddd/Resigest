-- V3: usuario administrador de prueba (correo: admin@resigest.com / contraseña: admin123).

INSERT INTO usuario (nombre_completo, correo, contrasena_hash, documento, activo, intentos_fallidos, fecha_creacion, fecha_actualizacion)
VALUES ('Administrador ResiGest', 'admin@resigest.com',
        '$2a$10$oPUWLw1gzT2cRPW2hrk0POuwQu./Hb2wiorGMxMuUbBLHzG.EEGde',
        '1000000001', TRUE, 0, now(), now());

INSERT INTO administrador (id)
SELECT id FROM usuario WHERE correo = 'admin@resigest.com';
