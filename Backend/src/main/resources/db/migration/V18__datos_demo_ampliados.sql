-- V18: datos de demostración adicionales para que todas las pantallas tengan contenido.
-- Las fechas son relativas a la fecha de aplicación de la migración.

-- Más residentes (apartamentos 102, 103, 201, 202); contraseña admin123
INSERT INTO usuario (nombre_completo, correo, contrasena_hash, documento, telefono, activo, intentos_fallidos, fecha_creacion, fecha_actualizacion)
SELECT v.nombre, v.correo, '$2a$10$oPUWLw1gzT2cRPW2hrk0POuwQu./Hb2wiorGMxMuUbBLHzG.EEGde', v.doc, v.tel, TRUE, 0, now(), now()
FROM (VALUES
  ('Valentina López', 'valentina@resigest.com', '1000000010', '3001112233'),
  ('Carlos Ruiz', 'carlos@resigest.com', '1000000011', '3002223344'),
  ('Marta Gómez', 'marta@resigest.com', '1000000012', '3003334455'),
  ('Andrés Pardo', 'andres@resigest.com', '1000000013', '3004445566')
) AS v(nombre, correo, doc, tel);

INSERT INTO residente (id, tipo_residente, apartamento_id)
SELECT u.id, v.tipo, a.id
FROM (VALUES
  ('valentina@resigest.com', 'PROPIETARIO', '1', '102'),
  ('carlos@resigest.com', 'ARRENDATARIO', '1', '103'),
  ('marta@resigest.com', 'PROPIETARIO', '2', '201'),
  ('andres@resigest.com', 'PROPIETARIO', '2', '202')
) AS v(correo, tipo, torre, numero)
JOIN usuario u ON u.correo = v.correo
JOIN torre t ON t.nombre = v.torre
JOIN apartamento a ON a.numero = v.numero AND a.torre_id = t.id;

-- Cartera de los últimos 3 meses para todos los apartamentos activos.
-- Meses anteriores: pagados. Mes en curso: pendiente; apartamentos 103 y 202 con el mes anterior vencido.
INSERT INTO obligacion_financiera (apartamento_id, concepto, periodo, monto_total, saldo_pendiente, estado, fecha_vencimiento, fecha_creacion, fecha_actualizacion)
SELECT a.id, 'CUOTA_ADMINISTRACION', to_char(m.mes, 'YYYY-MM'), 320000, 0, 'PAGADA',
       (m.mes + interval '9 days')::date, now(), now()
FROM apartamento a
CROSS JOIN (SELECT date_trunc('month', now()) - interval '2 month' AS mes) m
WHERE a.activo AND a.numero NOT IN ('103', '202');

INSERT INTO obligacion_financiera (apartamento_id, concepto, periodo, monto_total, saldo_pendiente, estado, fecha_vencimiento, fecha_creacion, fecha_actualizacion)
SELECT a.id, 'CUOTA_ADMINISTRACION', to_char(m.mes, 'YYYY-MM'), 320000, 0, 'PAGADA',
       (m.mes + interval '9 days')::date, now(), now()
FROM apartamento a
CROSS JOIN (SELECT date_trunc('month', now()) - interval '1 month' AS mes) m
WHERE a.activo AND a.numero NOT IN ('103', '202');

INSERT INTO obligacion_financiera (apartamento_id, concepto, periodo, monto_total, saldo_pendiente, estado, fecha_vencimiento, fecha_creacion, fecha_actualizacion)
SELECT a.id, 'CUOTA_ADMINISTRACION', to_char(m.mes, 'YYYY-MM'), 320000, 320000, 'VENCIDA',
       (m.mes + interval '9 days')::date, now(), now()
FROM apartamento a
CROSS JOIN (SELECT date_trunc('month', now()) - interval '2 month' AS mes) m
WHERE a.activo AND a.numero IN ('103', '202');

INSERT INTO obligacion_financiera (apartamento_id, concepto, periodo, monto_total, saldo_pendiente, estado, fecha_vencimiento, fecha_creacion, fecha_actualizacion)
SELECT a.id, 'CUOTA_ADMINISTRACION', to_char(m.mes, 'YYYY-MM'), 320000, 320000, 'VENCIDA',
       (m.mes + interval '9 days')::date, now(), now()
FROM apartamento a
CROSS JOIN (SELECT date_trunc('month', now()) - interval '1 month' AS mes) m
WHERE a.activo AND a.numero IN ('103', '202');

INSERT INTO obligacion_financiera (apartamento_id, concepto, periodo, monto_total, saldo_pendiente, estado, fecha_vencimiento, fecha_creacion, fecha_actualizacion)
SELECT a.id, 'CUOTA_ADMINISTRACION', to_char(m.mes, 'YYYY-MM'), 320000, 320000, 'PENDIENTE',
       (m.mes + interval '9 days')::date, now(), now()
FROM apartamento a
CROSS JOIN (SELECT date_trunc('month', now()) AS mes) m
WHERE a.activo;

-- Pagos aprobados (pasarela) de los meses ya pagados
INSERT INTO pago (metodo, monto, fecha, estado, referencia, obligacion_id, id_transaccion_externa, fecha_creacion, fecha_actualizacion)
SELECT 'WOMPI', o.monto_total, o.fecha_vencimiento - 3, 'APROBADO', 'DEMO-' || o.id, o.id, 'TX-DEMO-' || o.id, now(), now()
FROM obligacion_financiera o
WHERE o.estado = 'PAGADA';

-- Un pago por transferencia en verificación (apartamento 104, mes actual) para validar desde el administrador
UPDATE obligacion_financiera o SET estado = 'EN_VERIFICACION'
FROM apartamento a
WHERE o.apartamento_id = a.id AND a.numero = '104' AND o.estado = 'PENDIENTE';

INSERT INTO pago (metodo, monto, fecha, estado, referencia, obligacion_id, url_comprobante_adjunto, fecha_creacion, fecha_actualizacion)
SELECT 'TRANSFERENCIA', o.saldo_pendiente, now(), 'EN_VERIFICACION', 'TRF-DEMO-' || o.id, o.id, NULL, now(), now()
FROM obligacion_financiera o
WHERE o.estado = 'EN_VERIFICACION';

-- Reservas: una aprobada próxima, una pendiente por aprobar y una rechazada
INSERT INTO reserva (zona_comun_id, apartamento_id, fecha_inicio, fecha_fin, estado, version, justificacion_rechazo, fecha_creacion, fecha_actualizacion)
SELECT z.id, a.id, v.inicio, v.fin, v.estado, 0, v.motivo, now(), now()
FROM (VALUES
  ('BBQ', '101', date_trunc('day', now()) + interval '3 days 14 hours', date_trunc('day', now()) + interval '3 days 18 hours', 'APROBADA', NULL),
  ('Salón Social', '101', date_trunc('day', now()) + interval '8 days 15 hours', date_trunc('day', now()) + interval '8 days 20 hours', 'PENDIENTE', NULL),
  ('Cancha', '102', date_trunc('day', now()) + interval '5 days 17 hours', date_trunc('day', now()) + interval '5 days 19 hours', 'PENDIENTE', NULL),
  ('Salón Social', '201', date_trunc('day', now()) + interval '2 days 19 hours', date_trunc('day', now()) + interval '2 days 23 hours', 'RECHAZADA', 'El salón está reservado para una reunión de la administración.')
) AS v(zona, numero, inicio, fin, estado, motivo)
JOIN zona_comun z ON z.nombre = v.zona
JOIN apartamento a ON a.numero = v.numero;

-- Incidencias en cada estado
INSERT INTO incidencia (titulo, descripcion, ubicacion, categoria, estado, prioridad, reportado_por_id, asignado_a_id, solucion, fecha_creacion, fecha_actualizacion)
SELECT v.titulo, v.descripcion, v.ubicacion, v.categoria, v.estado, v.prioridad, r.id,
       CASE WHEN v.estado = 'ABIERTA' THEN NULL ELSE t.id END, v.solucion, now() - v.hace, now()
FROM (VALUES
  ('Ascensor de la torre 1 hace ruido', 'Al llegar al piso 3 se oye un ruido metálico.', 'Torre 1 · Lobby', 'ASCENSORES', 'ABIERTA', 'MEDIA', NULL, interval '1 day', 'valentina@resigest.com'),
  ('Bombillo quemado en el pasillo', 'El pasillo del piso 2 está a oscuras.', 'Torre 1 · Piso 2', 'ILUMINACION', 'ASIGNADA', 'BAJA', NULL, interval '2 days', 'carlos@resigest.com'),
  ('Fuga en el lavadero comunal', 'El grifo gotea sin parar.', 'Torre 2 · Piso 1', 'PLOMERIA', 'EN_PROCESO', 'ALTA', NULL, interval '3 days', 'marta@resigest.com'),
  ('Cerradura del portón peatonal', 'La cerradura se traba.', 'Zonas comunes', 'CARPINTERIA', 'RESUELTA', 'MEDIA', 'Se lubricó y se cambió el cilindro.', interval '9 days', 'andres@resigest.com')
) AS v(titulo, descripcion, ubicacion, categoria, estado, prioridad, solucion, hace, correo)
JOIN usuario r ON r.correo = v.correo
CROSS JOIN (SELECT id FROM usuario WHERE correo = 'tecnico@resigest.com') t;

-- Portería: paquetes e ingresos
INSERT INTO paquete (apartamento_destino_id, empresa_transportadora, descripcion, estado, fecha_recepcion, fecha_entrega, entregado_a, guia, tamano, fecha_creacion, fecha_actualizacion)
SELECT a.id, v.empresa, v.descripcion, v.estado, now() - v.hace,
       CASE WHEN v.estado = 'ENTREGADO' THEN now() - v.hace + interval '3 hours' END,
       CASE WHEN v.estado = 'ENTREGADO' THEN 'Residente Demo' END, v.guia, v.tamano, now(), now()
FROM (VALUES
  ('101', 'Rappi', 'Caja pequeña', 'RECIBIDO', 'RP-4829137', 'PEQUENO', interval '4 hours'),
  ('101', 'Mercado Libre', 'Paquete mediano', 'NOTIFICADO', 'ML-9912374', 'MEDIANO', interval '1 day'),
  ('101', 'Amazon', 'Caja grande', 'ENTREGADO', 'AMZ-1183742', 'GRANDE', interval '20 days'),
  ('102', 'Servientrega', 'Sobre', 'RECIBIDO', 'SV-5581231', 'SOBRE', interval '2 hours')
) AS v(numero, empresa, descripcion, estado, guia, tamano, hace)
JOIN apartamento a ON a.numero = v.numero;

INSERT INTO registro_ingreso (nombre_visitante, documento, tipo, empresa, apartamento_destino_id, registrado_por_id, fecha_ingreso, fecha_salida, fecha_creacion, fecha_actualizacion)
SELECT v.nombre, v.doc, v.tipo, v.empresa, a.id, p.id, now() - v.hace,
       CASE WHEN v.sale THEN now() - v.hace + interval '1 hour' END, now(), now()
FROM (VALUES
  ('Laura Martínez', '1098765432', 'VISITANTE', NULL, '101', interval '30 minutes', FALSE),
  ('Pedro Sánchez', '1087654321', 'VISITANTE', NULL, '102', interval '3 hours', TRUE),
  ('Repartidor Rappi', NULL, 'DOMICILIO', 'Rappi', '103', interval '5 hours', TRUE)
) AS v(nombre, doc, tipo, empresa, numero, hace, sale)
JOIN apartamento a ON a.numero = v.numero
CROSS JOIN (SELECT id FROM usuario WHERE correo = 'portero@resigest.com') p;

-- Comunicados y agenda
INSERT INTO comunicado (titulo, cuerpo, fijado, autor_id, fecha_publicacion, fecha_creacion, fecha_actualizacion)
SELECT v.titulo, v.cuerpo, v.fijado, u.id, now() - v.hace, now(), now()
FROM (VALUES
  ('Corte de agua programado', 'El jueves de 8:00 a 12:00 se suspenderá el servicio por mantenimiento de tanques.', TRUE, interval '1 day'),
  ('Asamblea general de copropietarios', 'Se convoca a asamblea ordinaria el próximo mes en el salón social.', FALSE, interval '6 days')
) AS v(titulo, cuerpo, fijado, hace)
CROSS JOIN (SELECT id FROM usuario WHERE correo = 'admin@resigest.com') u;

INSERT INTO evento (titulo, descripcion, fecha, lugar, tipo, fecha_creacion, fecha_actualizacion) VALUES
('Asamblea general', 'Asamblea ordinaria de copropietarios.', date_trunc('day', now()) + interval '12 days 18 hours', 'Salón Social', 'ASAMBLEA', now(), now()),
('Jornada de reciclaje', 'Entrega de material reciclable en el cuarto de basuras.', date_trunc('day', now()) + interval '6 days 9 hours', 'Cuarto de basuras', 'COMUNIDAD', now(), now()),
('Fumigación de zonas comunes', 'Se recomienda mantener las mascotas en casa.', date_trunc('day', now()) + interval '9 days 8 hours', 'Zonas comunes', 'MANTENIMIENTO', now(), now());
