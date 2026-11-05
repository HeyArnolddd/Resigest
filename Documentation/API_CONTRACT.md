# Contrato de API — ResiGest

Base URL: `http://localhost:8080`

Documentación interactiva (Swagger): `http://localhost:8080/swagger-ui.html`

## 1. Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{ "correo": "admin@resigest.com", "contrasena": "admin123" }
```

Respuesta `200`:

```json
{ "token": "eyJ...", "rol": "ADMINISTRADOR", "correo": "admin@resigest.com" }
```

En todas las demás llamadas, enviar:

```
Authorization: Bearer <token>
```

**Credenciales demo** (todas con contraseña `admin123`):
`admin@resigest.com` (ADMINISTRADOR) · `residente@resigest.com` (RESIDENTE) · `portero@resigest.com` (PORTERO) · `tecnico@resigest.com` (MANTENIMIENTO)

## 2. Convenciones

**Roles:** `ADMINISTRADOR`, `RESIDENTE`, `PORTERO`, `MANTENIMIENTO`

**Formato de error** (siempre esta forma):

```json
{
  "timestamp": "2026-10-27T10:00:00",
  "estado": 404,
  "codigo": "RECURSO_NO_ENCONTRADO",
  "mensaje": "No existe el apartamento con id 999",
  "erroresCampo": {}
}
```

**Códigos:**
- `401` sin token / token inválido
- `403` rol insuficiente o recurso de otro propietario
- `404` no existe
- `409` conflicto (duplicado, zona ocupada)
- `422` regla de negocio violada (moroso, coeficientes ≠ 100%)
- `400` datos de entrada inválidos (ver `erroresCampo`)

## 3. Usuarios

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/usuarios` | ADMINISTRADOR | Crear usuario → `201` UsuarioDTO |
| GET | `/api/usuarios?rol=RESIDENTE` | ADMINISTRADOR | → `[UsuarioDTO]` |
| GET | `/api/usuarios/me` | autenticado | → UsuarioDTO |

```json
// CrearUsuarioRequest
{ "nombreCompleto": "Ana", "correo": "ana@x.com", "contrasena": "secreto1",
  "documento": "123", "telefono": "300", "rol": "RESIDENTE",
  "tipoResidente": "ARRENDATARIO", "apartamentoId": 2 }

// UsuarioDTO
{ "id": 2, "nombreCompleto": "Ana", "correo": "ana@x.com", "documento": "123",
  "telefono": "300", "activo": true, "rol": "RESIDENTE",
  "residente": { "tipo": "ARRENDATARIO", "apartamentoId": 2, "apartamento": "Torre 1 – Apto 102", "alDia": true } }
// "residente" solo viene cuando rol = RESIDENTE; "alDia" solo en el listado (GET /api/usuarios)
```

## 4. Inmueble (torres y apartamentos)

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| GET | `/api/torres` | autenticado | → `[TorreDTO]` |
| POST | `/api/torres` | ADMINISTRADOR | `{nombre, numeroPisos}` → `201` TorreDTO |
| GET | `/api/torres/{id}` | autenticado | → TorreDTO |
| GET | `/api/apartamentos` | autenticado | → `[ApartamentoDTO]` |
| POST | `/api/apartamentos` | ADMINISTRADOR | `{torreId, numero, piso, coeficienteCopropiedad}` → `201` ApartamentoDTO |
| GET | `/api/apartamentos/{id}` | autenticado | → ApartamentoDTO |
| GET | `/api/apartamentos/{id}/estado-cuenta` | ADMINISTRADOR, RESIDENTE (dueño) | → EstadoCuentaDTO |

```json
// TorreDTO
{ "id": 1, "nombre": "1", "numeroPisos": 5 }

// ApartamentoDTO
{ "id": 1, "numero": "101", "piso": 1, "coeficienteCopropiedad": 10.0000,
  "activo": true, "torreId": 1, "torreNombre": "1", "identificadorCompleto": "Torre 1 – Apto 101" }

// EstadoCuentaDTO
{ "apartamentoId": 1, "apartamento": "Torre 1 – Apto 101", "totalPendiente": 1000.00,
  "obligaciones": [ /* [ObligacionDTO] */ ] }
```

## 5. Cartera (obligaciones)

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| GET | `/api/obligaciones?apartamentoId=1&estado=PENDIENTE` | ADMINISTRADOR, RESIDENTE | → `[ObligacionDTO]` |
| POST | `/api/obligaciones/generar` | ADMINISTRADOR | `{periodo, concepto, monto, fechaVencimiento}` → `[ObligacionDTO]` |
| POST | `/api/obligaciones/marcar-vencidas` | ADMINISTRADOR | → `204` |

```json
// ObligacionDTO
{ "id": 1, "concepto": "ARRIENDO", "periodo": "2026-10", "montoTotal": 1200.00,
  "saldoPendiente": 1200.00, "estado": "PENDIENTE", "fechaVencimiento": "2026-10-15" }
```

`concepto`: `ARRIENDO` | `CUOTA_ADMINISTRACION` | `SERVICIO_PUBLICO`
`estado`: `PENDIENTE` | `EN_VERIFICACION` | `PAGADA` | `VENCIDA`

## 6. Pagos

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/pagos/pasarela` | RESIDENTE | `{obligacionId}` → `200` PagoDTO |
| POST | `/api/pagos/manual` | RESIDENTE | `{obligacionId, urlComprobanteAdjunto}` → `201` PagoDTO |
| GET | `/api/pagos/pendientes-validacion` | ADMINISTRADOR | → `[PagoDTO]` |
| PATCH | `/api/pagos/{id}/validacion` | ADMINISTRADOR | `{aprobar: true, motivo: null}` → PagoDTO |
| POST | `/api/pagos/webhook` | público | `{idTransaccion, aprobada}` → 200 |
| GET | `/api/pagos/{id}/comprobante` | ADMINISTRADOR, RESIDENTE | → PDF (application/pdf) |

```json
// PagoDTO
{ "id": 1, "metodo": "WOMPI", "monto": 1200.00, "estado": "APROBADO",
  "fecha": "2026-10-27T10:00:00", "obligacionId": 1, "referencia": "PAGO-..." }
```

`metodo`: `WOMPI` | `TRANSFERENCIA` · `estado`: `INICIADO` | `EN_VERIFICACION` | `APROBADO` | `RECHAZADO`

## 7. Prorrateo de servicios

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/servicios/prorrateo/preview` | ADMINISTRADOR | `{tipo, periodo, total}` → `[ProrrateoDetalleDTO]` |
| POST | `/api/servicios/prorrateo/confirmar` | ADMINISTRADOR | `{tipo, periodo, total}` → ProrrateoResultadoDTO |

```json
// ProrrateoDetalleDTO
{ "apartamentoId": 1, "apartamento": "Torre 1 – Apto 101", "coeficiente": 10.0000, "valor": 150.00 }

// ProrrateoResultadoDTO
{ "facturaId": 1, "periodo": "2026-10", "total": 1500.00, "detalles": [ /* ... */ ] }
```

## 8. Reservas de zonas comunes

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| GET | `/api/zonas-comunes` | autenticado | → `[ZonaComunDTO]` |
| POST | `/api/zonas-comunes` | ADMINISTRADOR | `{nombre, descripcion, capacidad}` → `201` ZonaComunDTO |
| GET | `/api/reservas?zonaId=1` | autenticado | → `[ReservaDTO]` |
| POST | `/api/reservas` | RESIDENTE | `{zonaComunId, fechaInicio, fechaFin}` → `201` ReservaDTO |
| PATCH | `/api/reservas/{id}/aprobar` | ADMINISTRADOR | → ReservaDTO |
| PATCH | `/api/reservas/{id}/rechazar` | ADMINISTRADOR | `{justificacion}` → ReservaDTO |
| DELETE | `/api/reservas/{id}` | RESIDENTE | → `204` |

```json
// ZonaComunDTO
{ "id": 1, "nombre": "BBQ", "descripcion": "Zona de parrilla", "capacidad": 10, "activa": true }

// ReservaDTO
{ "id": 1, "zonaComunId": 1, "zonaComunNombre": "BBQ", "apartamentoId": 1,
  "fechaInicio": "2026-11-01T14:00:00", "fechaFin": "2026-11-01T18:00:00", "estado": "PENDIENTE" }
```

`estado`: `PENDIENTE` | `APROBADA` | `RECHAZADA` | `CANCELADA`

## 9. Mantenimiento (incidencias)

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| GET | `/api/incidencias` | ADMINISTRADOR, MANTENIMIENTO | → `[IncidenciaDTO]` |
| POST | `/api/incidencias` | RESIDENTE, PORTERO | `{titulo, descripcion, ubicacion, prioridad}` → `201` IncidenciaDTO |
| POST | `/api/incidencias/{id}/evidencias` | RESIDENTE | `multipart/form-data` campo `archivo` (máx 5MB) → IncidenciaDTO |
| PATCH | `/api/incidencias/{id}/asignacion` | ADMINISTRADOR | `{tecnicoId}` → IncidenciaDTO |
| PATCH | `/api/incidencias/{id}/solucion` | MANTENIMIENTO | `{solucion}` → IncidenciaDTO |

```json
// IncidenciaDTO
{ "id": 1, "titulo": "Fuga", "descripcion": "Hay una fuga", "ubicacion": "Baño",
  "estado": "ABIERTA", "prioridad": "ALTA", "reportadoPorId": 2, "asignadoAId": null, "solucion": null }
```

`estado`: `ABIERTA` | `ASIGNADA` | `EN_PROCESO` | `RESUELTA` · `prioridad`: `BAJA` | `MEDIA` | `ALTA`

## 10. Portería

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/porteria/ingresos` | PORTERO | `{nombreVisitante, documento, tipo, empresa, apartamentoDestinoId}` → `201` RegistroIngresoDTO |
| PATCH | `/api/porteria/ingresos/{id}/salida` | PORTERO | → `204` |
| GET | `/api/porteria/bitacora?desde=2026-10-01&hasta=2026-10-31` | ADMINISTRADOR | → `[RegistroIngresoDTO]` |
| POST | `/api/paquetes` | PORTERO | `{apartamentoDestinoId, empresaTransportadora, descripcion}` → `201` PaqueteDTO |
| PATCH | `/api/paquetes/{id}/entrega` | PORTERO | `{entregadoA}` → PaqueteDTO |
| GET | `/api/paquetes?apartamentoId=1` | ADMINISTRADOR, PORTERO, RESIDENTE | → `[PaqueteDTO]` |

`tipo` ingreso: `VISITANTE` | `DOMICILIO` · `estado` paquete: `RECIBIDO` | `NOTIFICADO` | `ENTREGADO`

## 11. Comunicaciones

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/comunicados` | ADMINISTRADOR | `{titulo, cuerpo, urlAdjunto}` → `201` ComunicadoDTO |
| GET | `/api/comunicados?fijados=true` | autenticado | → `[ComunicadoDTO]` |
| GET | `/api/notificaciones/no-leidas` | autenticado | → `[NotificacionDTO]` |
| PATCH | `/api/notificaciones/{id}/leida` | autenticado | → `204` |
| POST | `/api/chat` | autenticado | `{destinatarioId, contenido}` → MensajeChatDTO |
| GET | `/api/chat?conUsuarioId=3` | autenticado | → `[MensajeChatDTO]` |

```json
// ComunicadoDTO
{ "id": 1, "titulo": "Corte de agua", "cuerpo": "...", "urlAdjunto": null,
  "fijado": true, "autorId": 1, "fechaPublicacion": "2026-10-27T10:00:00" }

// NotificacionDTO
{ "id": 1, "titulo": "Reserva aprobada", "mensaje": "...", "tipo": "RESERVA",
  "leida": false, "fechaEnvio": "2026-10-27T10:00:00" }

// MensajeChatDTO
{ "id": 1, "remitenteId": 2, "destinatarioId": 3, "contenido": "Hola", "fecha": "2026-10-27T10:00:00" }
```

`tipo` notificación: `RESERVA` | `PAGO` | `INCIDENCIA` | `INGRESO` | `COMUNICADO`

## 12. Novedades recientes (para el front)

**Recuperación de contraseña:**

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/api/auth/recuperar` | `{ "correo": "..." }` | `200` (genera token de 1 h; en dev se imprime en el log del backend) |
| POST | `/api/auth/restablecer` | `{ "token": "...", "nuevaContrasena": "..." }` | `200` |

**Paginación** (ahora devuelven `Page`: `content`, `totalElements`, `totalPages`, `number`, `size`):

- `GET /api/usuarios?page=0&size=10`
- `GET /api/incidencias?page=0&size=10`

**Chat en tiempo real (WebSocket/STOMP):**

- Conexión: `ws://localhost:8080/ws`. El frame STOMP `CONNECT` **debe** llevar el header `Authorization: Bearer <token>`.
- Enviar: destino `/app/chat.enviar`, body `{ "destinatarioId": 3, "contenido": "Hola" }`. El remitente se toma del token (el `remitenteId` del cuerpo se ignora).
- Recibir: suscribirse a `/topic/chat/{miUsuarioId}`; solo se permite el canal propio.
- El mensaje también queda persistido (historial por `GET /api/chat?conUsuarioId=`).

## 13. Cambios de la integración con el frontend

**Seguridad.** Los roles son `RESIDENTE`, `ADMINISTRADOR`, `PORTERO` y `MANTENIMIENTO` (un rol sin permiso responde `403`). CORS permite el origen de `app.cors.origins` (por defecto `http://localhost:5173`). `POST /api/pagos/webhook` exige la cabecera `X-Signature` = HMAC-SHA256 (hex) de `"{idTransaccion}:{aprobada}"` con `app.webhook.secret`; sin ella responde `401`.

**Filtros y listados** (todos opcionales; fechas `yyyy-MM-dd`):

| Ruta | Rol | Parámetros |
|---|---|---|
| `GET /api/incidencias` | los 4 (residente y portero ven solo las suyas) | `estado`, `asignadoA=me`, `desde`, `hasta`, `page`, `size` |
| `PATCH /api/incidencias/{id}/inicio` | MANTENIMIENTO (técnico asignado) | pasa a `EN_PROCESO` |
| `GET /api/reservas` | autenticado | `zonaId`, `estado`, `mias=true`, `desde`, `hasta` |
| `PATCH /api/reservas/{id}/rechazar` | ADMINISTRADOR | `{ "justificacion": "..." }` (se guarda y viaja en `ReservaDTO`) |
| `GET /api/pagos` | ADMINISTRADOR; RESIDENTE (con su `apartamentoId`) | `estado`, `apartamentoId`, `desde`, `hasta` |
| `GET /api/paquetes` | ADMINISTRADOR, PORTERO; RESIDENTE (con su `apartamentoId`) | `apartamentoId`, `estado` |
| `GET /api/porteria/ingresos` | ADMINISTRADOR, PORTERO | visitantes que siguen dentro |
| `GET /api/porteria/bitacora` | ADMINISTRADOR, PORTERO | `desde`, `hasta` |
| `GET /api/usuarios` | ADMINISTRADOR | `rol` (`RESIDENTE`, `PORTERO`, ...) |

**DTO enriquecidos.** `IncidenciaDTO` (`categoria`, `fechaReporte`, `reportadoPorNombre`, `apartamento`, `asignadoANombre`, `evidencias[]`), `PagoDTO` (`apartamento`, `concepto`, `periodo`, `urlComprobanteAdjunto`, `motivoRechazo`), `ReservaDTO` (`apartamento`, `justificacionRechazo`), `PaqueteDTO` (`apartamento`, `guia`, `tamano`: `SOBRE|PEQUENO|MEDIANO|GRANDE`), `RegistroIngresoDTO` (`apartamento`, `registradoPorNombre`), `MensajeChatDTO` (`remitenteNombre`, `remitenteApartamento`, `destinatarioId` null en el chat comunitario). `CrearIncidenciaRequest` acepta `categoria`; `RegistrarPaqueteRequest` acepta `guia` y `tamano`.

**Archivos.** `POST /api/archivos` (multipart, campo `archivo`; JPG, PNG o PDF, máx. 5 MB) → `{ "url": "/api/archivos/<id>.<ext>" }`. `GET /api/archivos/{nombre}` descarga con token. Para un pago manual: subir el comprobante y enviar esa `url` en `POST /api/pagos/manual` (`urlComprobanteAdjunto`).

**Nuevos endpoints.**

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/api/reportes/dashboard` | ADMINISTRADOR | `{ periodo, facturado, recaudado, recaudoMensual[], cartera{apartamentos,alDia,enMora,saldoEnMora}, incidenciasPorEstado{}, usoZonas[], pendientes{} }` |
| GET | `/api/eventos?desde=&hasta=` | autenticado | `[{ id, titulo, descripcion, fecha, lugar, tipo }]` (por defecto, los próximos 3 meses) |
| POST | `/api/eventos` | ADMINISTRADOR | `{ titulo, descripcion, fecha, lugar, tipo }` → `201` |
| GET | `/api/contactos` | autenticado | `[{ id, nombre, detalle, telefono, categoria }]` |
| GET | `/api/chat/comunidad` | autenticado | últimos 100 mensajes del chat comunitario |
| POST | `/api/chat/comunidad` | autenticado | `{ "contenido": "..." }` |
| GET | `/api/chat/contactos` | autenticado | residentes con los que se puede conversar |
| GET | `/api/chat/conversaciones` | autenticado | contactos con los que ya hay mensajes |
