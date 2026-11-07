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

**Roles:** `ADMINISTRADOR`, `RESIDENTE`, `PORTERO`, `MANTENIMIENTO`. En las tablas, "ADMIN" es abreviatura de `ADMINISTRADOR` (en el código: `hasRole('ADMINISTRADOR')`).

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
| POST | `/api/usuarios` | ADMIN | CrearUsuarioRequest → `201` UsuarioDTO (`409` si el correo ya existe) |
| GET | `/api/usuarios?rol=&q=&activo=&page=0&size=20` | ADMIN | → `Page<UsuarioDTO>` (orden por defecto: nombre) |
| GET | `/api/usuarios/me` | autenticado | → UsuarioDTO |
| GET | `/api/usuarios/{id}` | ADMIN | → UsuarioDTO |
| PUT | `/api/usuarios/{id}` | ADMIN | ActualizarUsuarioRequest → UsuarioDTO |
| PATCH | `/api/usuarios/{id}/activar` | ADMIN | → `204` |
| PATCH | `/api/usuarios/{id}/desactivar` | ADMIN | → `204` (`422` si es la propia cuenta) |
| DELETE | `/api/usuarios/{id}` | ADMIN | → `204` (`409` si tiene historial: desactivar en su lugar) |
| PATCH | `/api/usuarios/{id}/contrasena` | ADMIN | `{ "contrasena": "..." }` → `204` |
| GET | `/api/usuarios/{id}/credenciales` | ADMIN | → CredencialesDTO (solo PORTERO y MANTENIMIENTO; `422` para otros roles) |

Filtros del listado (todos opcionales): `rol` (enum), `q` (busca en nombre, correo y documento), `activo` (`true`/`false`).

El **correo es el usuario** con el que se inicia sesión; se guarda en minúscula. Una cuenta desactivada no puede iniciar sesión y su token deja de servir de inmediato.

**Credenciales del personal:** al crear o cambiar la contraseña de un usuario de portería o mantenimiento, el backend guarda, además del hash BCrypt, una copia cifrada (AES-256-GCM, clave `app.credenciales.clave` / variable `RESIGEST_CLAVE_CREDENCIALES`) que el administrador puede consultar. La de residentes y administradores **no** se puede consultar, solo reemplazar.

```json
// CrearUsuarioRequest (turno solo para PORTERO, especialidad para MANTENIMIENTO,
// tipoResidente y apartamentoId obligatorios para RESIDENTE)
{ "nombreCompleto": "Ana", "correo": "ana@x.com", "contrasena": "secreto1",
  "documento": "123", "telefono": "300", "rol": "RESIDENTE",
  "tipoResidente": "ARRENDATARIO", "apartamentoId": 2, "turno": null, "especialidad": null }

// ActualizarUsuarioRequest: igual que crear, sin rol ni contrasena (el rol no cambia)

// UsuarioDTO (los campos que no aplican al rol vienen en null)
{ "id": 2, "nombreCompleto": "Ana", "correo": "ana@x.com", "documento": "123",
  "telefono": "300", "activo": true, "rol": "RESIDENTE",
  "tipoResidente": "ARRENDATARIO", "apartamentoId": 2, "apartamento": "Torre 1 – Apto 102",
  "turno": null, "especialidad": null, "fechaCreacion": "2026-11-04T20:00:00" }

// CredencialesDTO (contrasena = null si la cuenta se creó antes de esta función)
{ "correo": "portero@resigest.com", "contrasena": "Kx7mPq2nRt" }
```

## 4. Inmueble (torres y apartamentos)

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| GET | `/api/torres` | autenticado | → `[TorreDTO]` |
| POST | `/api/torres` | ADMIN | `{nombre, numeroPisos}` → `201` TorreDTO |
| GET | `/api/torres/{id}` | autenticado | → TorreDTO |
| GET | `/api/apartamentos` | autenticado | → `[ApartamentoDTO]` |
| POST | `/api/apartamentos` | ADMIN | `{torreId, numero, piso, coeficienteCopropiedad}` → `201` ApartamentoDTO |
| GET | `/api/apartamentos/{id}` | autenticado | → ApartamentoDTO |
| GET | `/api/apartamentos/{id}/estado-cuenta` | ADMIN, RESIDENTE (dueño) | → EstadoCuentaDTO |

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
| GET | `/api/obligaciones?apartamentoId=1&estado=PENDIENTE` | ADMIN, RESIDENTE | → `[ObligacionDTO]` |
| POST | `/api/obligaciones/generar` | ADMIN | `{periodo, concepto, monto, fechaVencimiento}` → `[ObligacionDTO]` |
| POST | `/api/obligaciones/marcar-vencidas` | ADMIN | → `204` |

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
| POST | `/api/pagos/en-linea/iniciar` | RESIDENTE (dueño) | `{obligacionId}` → `200` CheckoutPagoDTO |
| POST | `/api/pagos/en-linea/verificar` | RESIDENTE (dueño) | `{referencia}` → `200` PagoDTO |
| POST | `/api/pagos/manual` | RESIDENTE | `{obligacionId, urlComprobanteAdjunto}` → `201` PagoDTO |
| GET | `/api/pagos/pendientes-validacion` | ADMIN | → `[PagoDTO]` |
| PATCH | `/api/pagos/{id}/validacion` | ADMIN | `{aprobar: true, motivo: null}` → PagoDTO |
| POST | `/api/pagos/en-linea/confirmacion` | público (lo llama PayU) | formulario de confirmación de PayU (`reference_sale`, …) → 200 |
| GET | `/api/pagos/{id}/comprobante` | ADMIN, RESIDENTE | → PDF (application/pdf) |

```json
// PagoDTO
{ "id": 1, "metodo": "PAYU", "monto": 1200.00, "estado": "APROBADO",
  "fecha": "2026-10-27T10:00:00", "obligacionId": 1, "referencia": "PAGO-..." }
```

`metodo`: `PAYU` | `TRANSFERENCIA` · `estado`: `INICIADO` | `EN_VERIFICACION` | `APROBADO` | `RECHAZADO`

## 7. Prorrateo de servicios

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/servicios/prorrateo/preview` | ADMIN | `{tipo, periodo, total}` → `[ProrrateoDetalleDTO]` |
| POST | `/api/servicios/prorrateo/confirmar` | ADMIN | `{tipo, periodo, total}` → ProrrateoResultadoDTO |

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
| POST | `/api/zonas-comunes` | ADMIN | `{nombre, descripcion, capacidad, horaApertura?, horaCierre?}` → `201` ZonaComunDTO (horario por defecto 08:00–20:00) |
| GET | `/api/reservas?zonaId=1` | autenticado | → `[ReservaDTO]` |
| POST | `/api/reservas` | RESIDENTE | `{zonaComunId, fechaInicio, fechaFin}` → `201` ReservaDTO |
| PATCH | `/api/reservas/{id}/aprobar` | ADMIN | → ReservaDTO |
| PATCH | `/api/reservas/{id}/rechazar` | ADMIN | `{justificacion}` → ReservaDTO |
| DELETE | `/api/reservas/{id}` | RESIDENTE | → `204` |

```json
// ZonaComunDTO
{ "id": 1, "nombre": "BBQ", "descripcion": "Zona de parrilla", "capacidad": 10, "activa": true,
  "horaApertura": "10:00:00", "horaCierre": "22:00:00" }

// ReservaDTO
{ "id": 1, "zonaComunId": 1, "zonaComunNombre": "BBQ", "apartamentoId": 1,
  "fechaInicio": "2026-11-01T14:00:00", "fechaFin": "2026-11-01T18:00:00", "estado": "PENDIENTE" }
```

`estado`: `PENDIENTE` | `APROBADA` | `RECHAZADA` | `CANCELADA`

Una reserva debe empezar y terminar el mismo día, dentro del horario de la zona (`horaApertura`–`horaCierre`); si no, `422`.

## 9. Mantenimiento (incidencias)

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| GET | `/api/incidencias` | ADMIN, MANTENIMIENTO | → `[IncidenciaDTO]` |
| POST | `/api/incidencias` | RESIDENTE, PORTERO | `{titulo, descripcion, ubicacion, prioridad}` → `201` IncidenciaDTO |
| POST | `/api/incidencias/{id}/evidencias` | RESIDENTE | `multipart/form-data` campo `archivo` (máx 5MB) → IncidenciaDTO |
| PATCH | `/api/incidencias/{id}/asignacion` | ADMIN | `{tecnicoId}` → IncidenciaDTO |
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
| GET | `/api/porteria/bitacora?desde=2026-10-01&hasta=2026-10-31` | ADMIN | → `[RegistroIngresoDTO]` |
| POST | `/api/paquetes` | PORTERO | `{apartamentoDestinoId, empresaTransportadora, descripcion}` → `201` PaqueteDTO |
| PATCH | `/api/paquetes/{id}/entrega` | PORTERO | `{entregadoA}` → PaqueteDTO |
| GET | `/api/paquetes?apartamentoId=1` | ADMIN, PORTERO, RESIDENTE | → `[PaqueteDTO]` |

`tipo` ingreso: `VISITANTE` | `DOMICILIO` · `estado` paquete: `RECIBIDO` | `NOTIFICADO` | `ENTREGADO`

## 11. Comunicaciones

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/comunicados` | ADMIN | `{titulo, cuerpo, urlAdjunto}` → `201` ComunicadoDTO |
| GET | `/api/comunicados?fijados=true` | autenticado | → `[ComunicadoDTO]` |
| GET | `/api/notificaciones/no-leidas` | autenticado | → `[NotificacionDTO]` |
| PATCH | `/api/notificaciones/{id}/leida` | autenticado | → `204` |
| POST | `/api/chat` | autenticado | `{destinatarioId, contenido}` → `201` MensajeChatDTO |
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

- `GET /api/usuarios?page=0&size=10` (ver sección 3 para los filtros)
- `GET /api/incidencias?page=0&size=10`

**Chat en tiempo real (WebSocket/STOMP):**

- Conexión: `ws://localhost:8080/ws` (sin token; el front enviará el `remitenteId` en el payload).
- Enviar: destino `/app/chat.enviar`, body `{ "remitenteId": 2, "destinatarioId": 3, "contenido": "Hola" }`.
- Recibir: suscribirse a `/topic/chat/{destinatarioId}`.
- El mensaje también queda persistido (historial por `GET /api/chat?conUsuarioId=`).

## 13. Cambios del backend hechos desde la rama `frontend`

Para conectar las pantallas de residente, portería y mantenimiento se tocó el backend. Todo lo nuevo está aquí.

**Migraciones nuevas:** `V16` (paquete: `guia`, `tamano`), `V17` (incidencia: `categoria`), `V18` (tablas `archivo`, `mensaje_comunidad`, `evento`; paquete: `foto_url`), `V19` (mensaje_comunidad: `torre_id`, chat por torre), `V20` (incidencia: `foto_solucion_url`, `observacion_confirmacion`; zonas: se quita la Cancha de ejemplo y se agrega la Piscina).

**Archivos (fotos y comprobantes).** Se guardan en la base de datos (tabla `archivo`), no en disco, para que no se pierdan al redesplegar. Solo JPG, PNG, WEBP o PDF, máx. 5 MB.

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| POST | `/api/archivos` | autenticado | multipart `archivo` → `201` `{id, nombre, tipoContenido, tamano, url}` |
| GET | `/api/archivos/{id}` | autenticado | → el archivo (imagen o PDF) |

**Chats comunitarios:** el general del conjunto lo ven todos; el de cada torre, solo los residentes de esa torre y la administración (la administración ve todos). Portería y mantenimiento solo ven el general. Pedir o escribir en el chat de otra torre responde `403`.

**Nuevos endpoints**

| Método | Ruta | Rol | Body → Response |
|---|---|---|---|
| GET | `/api/usuarios/directorio` | autenticado | → `[{id, nombreCompleto, rol, detalle, telefono}]` (teléfono solo de personal y admin) |
| GET | `/api/chat/conversaciones` | autenticado | → `[{usuarioId, nombre, detalle, ultimoMensaje, fecha, ultimoEsMio}]` |
| GET | `/api/chat/comunidad/canales` | autenticado | → `[{torreId, nombre}]` chats a los que tiene acceso (`torreId` null = general) |
| GET | `/api/chat/comunidad?torreId=` | autenticado | → últimos 100 mensajes del chat (sin `torreId` = general) |
| POST | `/api/chat/comunidad` | autenticado | `{contenido, torreId}` → MensajeComunidadDTO |
| GET | `/api/eventos?desde=` | autenticado | → próximos eventos de la agenda (por defecto desde hoy) |
| POST | `/api/eventos` | ADMIN | `{titulo, descripcion, fecha, horaInicio, horaFin, lugar, tipo}` → `201` (`tipo`: `ASAMBLEA` \| `MANTENIMIENTO` \| `TRAMITE` \| `EVENTO`) |
| DELETE | `/api/eventos/{id}` | ADMIN | → `204` |
| GET | `/api/incidencias/mias` | RESIDENTE, PORTERO | → las que reportó el usuario |
| GET | `/api/incidencias/asignadas` | MANTENIMIENTO | → las asignadas al técnico |
| PATCH | `/api/incidencias/{id}/inicio` | MANTENIMIENTO (asignado) | → ASIGNADA → EN_PROCESO |
| PATCH | `/api/incidencias/{id}/confirmacion` | RESIDENTE, PORTERO (quien la reportó) | `{solucionado, comentario}` → RESUELTA → CERRADA, o vuelve a EN_PROCESO con el comentario |
| GET | `/api/porteria/ingresos/dentro` | PORTERO, ADMIN | → quienes no han registrado salida |
| PATCH | `/api/paquetes/{id}/recogido` | RESIDENTE (dueño) | → el residente confirma que ya lo recogió |
| GET | `/api/pagos?apartamentoId=` | ADMIN, RESIDENTE (dueño) | → historial de pagos del apartamento |

**Endpoints que cambiaron**

- `GET /api/paquetes`: `apartamentoId` ahora es opcional para PORTERO y ADMIN (todo el conjunto). El residente debe indicarlo.
- `GET /api/reservas`: `zonaId`, `apartamentoId` y `estado` son opcionales.
- `GET /api/porteria/bitacora`: ahora también PORTERO.
- `PATCH /api/incidencias/{id}/solucion`: solo el técnico asignado; ahora exige `fotoUrl` (foto del trabajo terminado, subida antes a `/api/archivos`). La incidencia queda RESUELTA esperando la confirmación de quien la reportó.
- Estados de incidencia: `ABIERTA` → `ASIGNADA` → `EN_PROCESO` → `RESUELTA` (por confirmar) → `CERRADA` (confirmada).
- `POST /api/incidencias/{id}/evidencias`: también PORTERO; solo quien la reportó. Las evidencias ahora se guardan de verdad.
- `POST /api/pagos/manual`: `urlComprobanteAdjunto` debe ser una URL de `/api/archivos/{id}`; nuevo campo opcional `referencia`. La obligación pasa a EN_VERIFICACION y vuelve a PENDIENTE/VENCIDA si se rechaza.
- `POST /api/paquetes`: nuevos campos opcionales `guia`, `tamano`, `fotoUrl`.
- `POST /api/incidencias`: nuevo campo opcional `categoria`.
- `TipoIngreso`: nuevo valor `SERVICIO`.
- Zonas comunes: `V22` vuelve a crear (o reactiva) el **Gimnasio** (capacidad 15). Quedan BBQ, Salón Social, Piscina y Gimnasio.
- `POST /api/obligaciones/generar`: nuevo campo opcional `apartamentos: [{apartamentoId, monto}]` para generar la cuota solo a esos apartamentos; `monto` de cada uno es opcional (si falta se usa el `monto` general). Sin `apartamentos`, se genera para todos los activos como antes. Sigue sin duplicar la cuota de un mes que el apartamento ya tenga.

**DTO con campos nuevos:** `PaqueteDTO` (`apartamento`, `guia`, `tamano`, `fotoUrl`), `RegistroIngresoDTO` (`apartamento`, `registradoPorNombre`), `IncidenciaDTO` (`categoria`, `reportadoPorNombre`, `apartamento`, `asignadoANombre`, `fechaReporte`, `evidencias`, `fotoSolucionUrl`, `observacionConfirmacion`), `ReservaDTO` (`apartamento`), `PagoDTO` (`apartamento`, `concepto`, `periodo`, `urlComprobante`, `motivoRechazo`), `ObligacionDTO` (`apartamentoId`, `apartamento`), `ComunicadoDTO` (`autorNombre`).

**Notificaciones:** se avisa a todos los residentes del apartamento (antes solo a uno) y se agregaron avisos de paquete recibido, visita en portería, incidencia asignada (al técnico) e incidencia resuelta (a quien la reportó). Cada aviso se guarda en su propia transacción (antes podían perderse).

**Pago en línea con PayU Latam (WebCheckout).** Antes la pasarela simulada aprobaba todo al instante y `POST /api/pagos/webhook` le creía a cualquiera que enviara `{idTransaccion, aprobada: true}`. Ahora hay dos formas de pagar:

- **En línea (PayU):** se aprueba en cuanto PayU confirma el cobro, sin intervención del administrador.
- **Transferencia con comprobante** (`POST /api/pagos/manual`, sin cambios): queda `EN_VERIFICACION` hasta que el administrador la aprueba o rechaza.

Flujo en línea:

1. `POST /api/pagos/en-linea/iniciar` crea un `PagoPasarela` en `INICIADO` por el saldo pendiente, con referencia única `RG-{obligacionId}-{12 caracteres}`, y devuelve `CheckoutPagoDTO {pagoId, referencia, monto, urlCheckout, campos}`. `campos` es el formulario firmado de WebCheckout (`merchantId`, `accountId`, `description`, `referenceCode`, `amount`, `tax`, `taxReturnBase`, `currency`, `signature`, `test`, `lng` y `confirmationUrl` si está configurada). Firma: `MD5("ApiKey~merchantId~referenceCode~amount~currency")`, calculada en el backend. Obligación saldada o en verificación → `422`.
2. El frontend agrega `buyerEmail`, `buyerFullName`, `telephone` y `responseUrl` y envía el formulario por POST a `urlCheckout`. El residente paga en PayU.
3. PayU devuelve al frontend con `?referenceCode=…` y el frontend llama `POST /api/pagos/en-linea/verificar`. El backend consulta la API de consultas de PayU (`ORDER_DETAIL_BY_REFERENCE_CODE`) y aplica el resultado: `APPROVED` con el mismo valor y moneda COP → `APROBADO` y abono a la obligación; `DECLINED`/`EXPIRED`/`ERROR`… → `RECHAZADO`; `PENDING` → sigue `INICIADO`. Es idempotente (fila bloqueada, solo cambia pagos `INICIADO`).
4. `POST /api/pagos/en-linea/confirmacion` (página de confirmación de PayU, pública) no le cree al aviso: toma `reference_sale` y vuelve a consultar en PayU.

Por defecto se usa el **sandbox de PayU** con las credenciales públicas de prueba de su documentación (merchant `508029`, cuenta Colombia `512321`): no se mueve dinero real y no hay que registrar ningún comercio. Para aprobar un pago de prueba se escribe `APPROVED` como nombre del titular de la tarjeta; `REJECTED` para rechazarlo.

Se eliminaron `POST /api/pagos/pasarela`, `POST /api/pagos/webhook`, `PasarelaSimulada`, `WompiPasarelaAdapter` y la propiedad `app.pasarela`. `V21` renombra el método `WOMPI` a `PAYU`. `GET /api/pagos` no lista los pagos en línea que quedaron `INICIADO` (pagos abandonados).

Variables (todas opcionales; sin ellas se usa el sandbox): `PAYU_URL_CHECKOUT`, `PAYU_URL_CONSULTAS`, `PAYU_MERCHANT_ID`, `PAYU_ACCOUNT_ID`, `PAYU_API_LOGIN`, `PAYU_API_KEY`, `PAYU_PRUEBAS` (`true`) y `PAYU_URL_CONFIRMACION` (URL pública de `/api/pagos/en-linea/confirmacion`).

**Rendimiento (BD remota):** `hibernate.default_batch_fetch_size=50`, `readOnlyMode=ignore` en el driver de PostgreSQL y el usuario autenticado se recuerda 20 s (`CacheUsuarios`, se vacía al editar, activar, desactivar, eliminar o cambiar la contraseña de un usuario).

## Seguridad: pagos y WebSocket

- **Pagos en línea**: el webhook firmado de Wompi (`POST /api/pagos/webhook`) se reemplazó por PayU. El aviso público `POST /api/pagos/en-linea/confirmacion` no se cree lo que recibe: vuelve a consultar el estado del pago directamente en PayU (ver §13).
- **Chat por WebSocket (STOMP)**: el frame `CONNECT` debe llevar `Authorization: Bearer <token>`. Cada usuario solo puede suscribirse a `/topic/chat/{su id}`, y el remitente se toma del token (el `remitenteId` del cuerpo se ignora). Los orígenes permitidos son los de `CORS_ORIGENES`.

## Ajustes tras las pruebas funcionales

- **Sin token → `401`**: una petición sin token, o con un token vencido o inválido, responde `401` con ApiError (`codigo: "NO_AUTENTICADO"`). Antes respondía `403` sin cuerpo. `403` queda solo para "sin permiso".
- **`POST /api/chat` → `201`** (antes `200`).
- **`PATCH /api/incidencias/{id}/solucion`**: si falta la solución o la foto responde `422` con el motivo ("Debe registrar la solución aplicada" / "Adjunta una foto del trabajo terminado"). Antes respondía `400` "Datos inválidos".
- **Horario de las zonas** (`V23`): cada zona tiene `horaApertura` y `horaCierre` (BBQ 10–22, Salón Social 8–23, Gimnasio y Cancha 6–22, Piscina 8–20; las demás 8–20). Las reservas fuera del horario o que pasan al día siguiente responden `422`.
