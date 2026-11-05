-- V16: número de guía y tamaño del paquete.
ALTER TABLE paquete ADD COLUMN guia VARCHAR(50);
ALTER TABLE paquete ADD COLUMN tamano VARCHAR(20) NOT NULL DEFAULT 'MEDIANO';
