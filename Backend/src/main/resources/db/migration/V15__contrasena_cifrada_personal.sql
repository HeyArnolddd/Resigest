-- V15: copia cifrada (AES-GCM) de la contraseña del personal operativo
-- (portería y mantenimiento), para que el administrador pueda consultarla.
-- Los residentes y administradores la dejan en NULL: solo se guarda su hash.

ALTER TABLE usuario ADD COLUMN contrasena_cifrada VARCHAR(512);
