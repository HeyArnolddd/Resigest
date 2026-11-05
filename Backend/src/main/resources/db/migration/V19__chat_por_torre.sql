-- V19: el chat comunitario se divide en canales. torre_id NULL = chat general del conjunto;
-- con torre = chat solo para los residentes de esa torre (y la administración).

ALTER TABLE mensaje_comunidad ADD COLUMN torre_id BIGINT REFERENCES torre(id);

CREATE INDEX idx_mensaje_comunidad_torre_fecha ON mensaje_comunidad (torre_id, fecha);
