-- V16: datos que portería toma al recibir un paquete: número de guía y tamaño
-- (el tamaño decide en qué parte de la estantería va y el ícono que ve el residente).

ALTER TABLE paquete ADD COLUMN guia VARCHAR(60);
ALTER TABLE paquete ADD COLUMN tamano VARCHAR(30);
