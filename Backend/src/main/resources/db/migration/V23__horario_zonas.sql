-- V23: cada zona común tiene un horario de uso; las reservas deben quedar dentro de él.
ALTER TABLE zona_comun ADD COLUMN hora_apertura TIME NOT NULL DEFAULT '08:00';
ALTER TABLE zona_comun ADD COLUMN hora_cierre TIME NOT NULL DEFAULT '20:00';

UPDATE zona_comun SET hora_apertura = '10:00', hora_cierre = '22:00' WHERE nombre = 'BBQ';
UPDATE zona_comun SET hora_apertura = '08:00', hora_cierre = '23:00' WHERE nombre = 'Salón Social';
UPDATE zona_comun SET hora_apertura = '06:00', hora_cierre = '22:00' WHERE nombre IN ('Cancha', 'Gimnasio');
UPDATE zona_comun SET hora_apertura = '08:00', hora_cierre = '20:00' WHERE nombre = 'Piscina';

ALTER TABLE zona_comun ADD CONSTRAINT ck_zona_comun_horario CHECK (hora_apertura < hora_cierre);
