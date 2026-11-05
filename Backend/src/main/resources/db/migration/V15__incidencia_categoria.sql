-- V15: categoría de la incidencia (plomería, eléctrico, etc.).
ALTER TABLE incidencia ADD COLUMN categoria VARCHAR(30) NOT NULL DEFAULT 'OTRO';
