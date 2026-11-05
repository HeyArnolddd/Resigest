-- V17: categoría de la incidencia (Plomería, Eléctrico, Ascensores…), elegida por quien la reporta.

ALTER TABLE incidencia ADD COLUMN categoria VARCHAR(40);
