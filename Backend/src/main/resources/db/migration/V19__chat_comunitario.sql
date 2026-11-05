-- V19: el chat comunitario no tiene destinatario.
ALTER TABLE mensaje_chat ALTER COLUMN destinatario_id DROP NOT NULL;
