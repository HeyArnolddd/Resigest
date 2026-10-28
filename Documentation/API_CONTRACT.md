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
`admin@resigest.com` (ADMIN) · `residente@resigest.com` (RESIDENTE) · `portero@resigest.com` (PORTERO) · `tecnico@resigest.com` (MANTENIMIENTO)

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
| POST | `/api/usuarios` | ADMIN | Crear usuario → `201` UsuarioDTO |
| GET | `/api/usuarios?rol=RESIDENTE` | ADMIN | → `[UsuarioDTO]` |
| GET | `/api/usuarios/me` | autenticado | → UsuarioDTO |

```json
// CrearUsuarioRequest
{ "nombreCompleto": "Ana", "correo": "ana@x.com", "contrasena": "secreto1",
  "documento": "123", "telefono": "300", "rol": "RESIDENTE",
  "tipoResidente": "ARRENDATARIO", "apartamentoId": 2 }

// UsuarioDTO
{ "id": 2, "nombreCompleto": "Ana", "correo": "ana@x.com", "documento": "123",
  "telefono": "300", "activo": true, "rol": "RESIDENTE" }
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
| POST | `/api/pagos/pasarela` | RESIDENTE | `{obligacionId}` → `200` PagoDTO |
| POST | `/api/pagos/manual` | RESIDENTE | `{obligacionId, urlComprobanteAdjunto}` → `201` PagoDTO |
| GET | `/api/pagos/pendientes-validacion` | ADMIN | → `[PagoDTO]` |
| PATCH | `/api/pagos/{id}/validacion` | ADMIN | `{aprobar: true, motivo: null}` → PagoDTO |
| POST | `/api/pagos/webhook` | público | `{idTransaccion, aprobada}` → 200 |
| GET | `/api/pagos/{id}/comprobante` | ADMIN, RESIDENTE | → PDF (application/pdf) |

```json
// PagoDTO
{ "id": 1, "metodo": "WOMPI", "monto": 1200.00, "estado": "APROBADO",
  "fecha": "2026-10-27T10:00:00", "obligacionId": 1, "referencia": "PAGO-..." }
```

`metodo`: `WOMPI` | `TRANSFERENCIA` · `estado`: `INICIADO` | `EN_VERIFICACION` | `APROBADO` | `RECHAZADO`

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
| POST | `/api/zonas-comunes` | ADMIN | `{nombre, descripcion, capacidad}` → `201` ZonaComunDTO |
| GET | `/api/reservas?zonaId=1` | autenticado | → `[ReservaDTO]` |
| POST | `/api/reservas` | RESIDENTE | `{zonaComunId, fechaInicio, fechaFin}` → `201` ReservaDTO |
| PATCH | `/api/reservas/{id}/aprobar` | ADMIN | → ReservaDTO |
| PATCH | `/api/reservas/{id}/rechazar` | ADMIN | `{justificacion}` → ReservaDTO |
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
