# Pendientes del backend para conectar el frontend

El frontend ya tiene las pantallas de los 4 roles (rama `mockups`), pero todavía funciona con datos de prueba (`Frontend/src/data/mock.js`). El siguiente paso es conectarlo al API. Este documento recoge lo que el backend necesita para que eso funcione, comparando las pantallas con `API_CONTRACT.md` y con el código de `Backend/src`.

Para ver las pantallas: `cd Frontend && npm install && npm run dev` → http://localhost:5173 (usuarios demo, contraseña `admin123`).

Prioridades:
- **P0**: bloquea la conexión. Sin esto el rol no funciona.
- **P1**: una pantalla queda incompleta o vacía.
- **P2**: mejora la experiencia; se puede dejar para después.

---

## P0. Bloqueantes

### 1. El administrador recibe 403 en todos sus endpoints (por verificar)

`UsuarioAutenticado` crea la autoridad como `"ROLE_" + rol.name()`, es decir, `ROLE_ADMINISTRADOR`. Sin embargo, los controladores usan `@PreAuthorize("hasRole('ADMIN')")`, que busca `ROLE_ADMIN`. No hay `RoleHierarchy` ni mapeo que los relacione.

Si es así, todas las rutas marcadas `ADMIN` responden 403 al administrador. No pude probarlo porque el backend no estaba corriendo. Prueba rápida:

```bash
# con el token de admin@resigest.com
curl -H "Authorization: Bearer <token>" localhost:8080/api/usuarios
```

**Arreglo sugerido:** cambiar `hasRole('ADMIN')` por `hasRole('ADMINISTRADOR')` en todos los controladores, y en el contrato poner `ADMINISTRADOR` en vez de `ADMIN` en la columna Rol para que todo coincida. Agregar un test de controlador que llame a una ruta de admin con un admin y espere 200.

### 2. El residente no sabe cuál es su apartamento

Casi todas las pantallas del residente necesitan `apartamentoId`: estado de cuenta, obligaciones, paquetes y reservas. Sin embargo, `GET /api/usuarios/me` devuelve un `UsuarioDTO` sin apartamento.

**Pedido:** que `/api/usuarios/me` incluya, cuando el usuario es residente:

```json
{
  "id": 5, "nombreCompleto": "Juan Pérez", "rol": "RESIDENTE", "...": "...",
  "residente": {
    "tipo": "PROPIETARIO",
    "apartamentoId": 12,
    "apartamento": "Torre 2 - 304"
  }
}
```

### 3. CORS

`SecurityConfig` no tiene configuración de CORS. En desarrollo el frontend usará un proxy de Vite (`/api` → `localhost:8080`), así que no es urgente para programar. Sí lo es para desplegar o para probar el frontend contra un backend en otra máquina.

**Pedido:** habilitar CORS para el origen del frontend (configurable por variable de entorno, por defecto `http://localhost:5173`), permitiendo el header `Authorization` y los métodos `GET, POST, PATCH, DELETE`.

---

## P1. Endpoints que faltan o están restringidos

| # | Pantalla | Problema | Pedido |
|---|---|---|---|
| 4 | Residente → Incidencias | `GET /api/incidencias` es solo para ADMIN y MANTENIMIENTO. El residente no puede ver las incidencias que reportó. | Permitir RESIDENTE (y PORTERO) en esa ruta, devolviendo solo las que reportó él, o crear `GET /api/incidencias/mias`. |
| 5 | Mantenimiento → Inicio / Historial | No hay forma de pedir solo las incidencias asignadas al técnico ni las resueltas en un rango de fechas. | Filtros en `GET /api/incidencias`: `?asignadoA=me`, `?estado=`, `?desde=&hasta=`. |
| 6 | Mantenimiento → Incidencias | No existe un paso para marcar `EN_PROCESO` (el enum lo tiene, pero solo hay `asignacion` y `solucion`). | `PATCH /api/incidencias/{id}/inicio` (MANTENIMIENTO) → estado `EN_PROCESO`. |
| 7 | Incidencias (todos) | No se pueden ver las fotos subidas. Solo existe el `POST` de evidencias. | `GET /api/incidencias/{id}/evidencias` → lista de URLs; o incluir `evidencias: [url]` en `IncidenciaDTO`. |
| 8 | Portería → Inicio / Visitantes | No hay ruta para listar ingresos. La bitácora es solo para ADMIN, y el portero necesita ver quién está adentro para registrar la salida. | `GET /api/porteria/ingresos?activos=true` (PORTERO, ADMIN) y permitir PORTERO en `/bitacora` (la pantalla "Bitácora" es del portero). |
| 9 | Portería → Paquetes | No hay forma de listar todos los paquetes pendientes del conjunto (solo por `apartamentoId`). | `GET /api/paquetes?estado=RECIBIDO` sin `apartamentoId` para PORTERO/ADMIN. |
| 10 | Residente → Reservas | `GET /api/reservas` solo filtra por zona. El residente necesita ver sus propias reservas. | Filtro `?apartamentoId=` (o `?mias=true`) y `?desde=&hasta=` para el calendario. |
| 11 | Admin → Reservas | Solicitudes pendientes por aprobar. | Filtro `?estado=PENDIENTE` en `GET /api/reservas`. |
| 12 | Admin → Finanzas | Lista de pagos aprobados y rechazados (historial), no solo los pendientes. | `GET /api/pagos?estado=&desde=&hasta=` (ADMIN). |
| 13 | Residente → Finanzas | La pantalla muestra el historial de pagos del apartamento, pero no hay ruta para listar pagos del residente. | `GET /api/pagos?apartamentoId=` (RESIDENTE dueño, ADMIN). |
| 14 | Admin → Dashboard | Los indicadores no tienen fuente: recaudo del mes frente a lo facturado, apartamentos al día o en mora, uso de zonas, incidencias por estado y pendientes por aprobar. | `GET /api/reportes/dashboard` (ADMIN) con esos agregados; ver forma sugerida abajo. |
| 15 | Admin → Residentes | Directorio de residentes con torre/apartamento y estado de cartera. `UsuarioDTO` no trae apartamento. | Incluir el bloque `residente` (punto 2) en `GET /api/usuarios?rol=RESIDENTE`, y si es posible `alDia: true/false`. |

Forma sugerida para el dashboard (punto 14):

```json
{
  "periodo": "2026-10",
  "facturado": 48000000, "recaudado": 39500000,
  "recaudoMensual": [{ "periodo": "2026-05", "facturado": 0, "recaudado": 0 }],
  "cartera": { "apartamentos": 120, "alDia": 98, "enMora": 22, "saldoEnMora": 0 },
  "incidenciasPorEstado": { "ABIERTA": 0, "ASIGNADA": 0, "EN_PROCESO": 0, "RESUELTA": 0 },
  "usoZonas": [{ "zonaId": 1, "nombre": "Salón social", "reservasMes": 0 }],
  "pendientes": { "pagosPorValidar": 0, "reservasPorAprobar": 0 }
}
```

---

## P1. Campos que las pantallas muestran y los DTO no traen

| DTO | Falta | Para qué |
|---|---|---|
| `IncidenciaDTO` | `categoria` (Plomería, Eléctrico, Jardinería, Carpintería, Cubierta, Equipos…), `fechaReporte`, `reportadoPorNombre`, `asignadoANombre`, `apartamento` | Las tarjetas muestran la ilustración según la categoría, la fecha y los nombres. Hoy solo vienen los ids. |
| `CrearIncidenciaRequest` | `categoria` | El formulario del residente tiene selector de categoría. |
| `PaqueteDTO` | `guia` (número de guía), `tamano` (`SOBRE`, `PEQUENO`, `MEDIANO`, `GRANDE`), `apartamento` (texto "Torre 2 - 304") | La etiqueta del paquete y el ícono dependen del tamaño; portería busca por guía. |
| `RegistrarPaqueteRequest` | `guia`, `tamano` | El modal de portería ya los pide. |
| `RegistroIngresoDTO` | `apartamento` (texto), `registradoPorNombre` | Los gafetes y la bitácora muestran torre/apto y quién registró. |
| `ReservaDTO` | `apartamento` (texto), `residenteNombre`, `justificacionRechazo` | Agenda del admin y aviso al residente cuando se rechaza. |
| `PagoDTO` | `apartamento`, `concepto`/`periodo` de la obligación, `urlComprobanteAdjunto`, `banco` | La pantalla de validación muestra el recibo con estos datos. |
| `MensajeChatDTO` | `remitenteNombre` | Mostrar quién escribe sin consultar otro endpoint. |
| `ComunicadoDTO` | `autorNombre` | Firma del comunicado. |

Regla general: **donde hoy va solo un id, agregar también el nombre o texto legible**. Así el frontend no tiene que hacer una consulta extra por cada fila.

---

## P1. Archivos

| # | Problema | Pedido |
|---|---|---|
| 16 | `POST /api/pagos/manual` recibe `urlComprobanteAdjunto`, pero el residente sube una **imagen o PDF** desde su equipo; no tiene una URL. | Aceptar `multipart/form-data` (campo `archivo` + `obligacionId`) igual que en evidencias, o un endpoint genérico `POST /api/archivos` → `{ url }`. |
| 17 | El admin necesita ver el comprobante adjunto antes de aprobar. | Servir el archivo subido (`GET` que devuelva la imagen/PDF), con la misma regla de permisos. |

---

## P2. Comunidad (residente)

La pantalla de Comunidad tiene cuatro partes; hoy solo la mensajería privada tiene API.

| # | Parte | Estado | Pedido |
|---|---|---|---|
| 18 | Comunicados en cartelera | ✅ `GET /api/comunicados` | Ninguno. |
| 19 | Agenda del conjunto (eventos) | ❌ | `GET /api/eventos?desde=&hasta=` (autenticado), `POST /api/eventos` (ADMIN) con `{titulo, descripcion, fecha, lugar, tipo}`. |
| 20 | Directorio de contactos (portería, administración, emergencias) | ❌ | `GET /api/contactos` (autenticado). Puede ser una tabla simple administrada por el admin, o incluso datos fijos en una migración. |
| 21 | Chat comunitario (grupo de todo el conjunto) | ❌. El chat actual es solo 1 a 1. | `GET/POST /api/chat/comunidad`, o permitir `destinatarioId = null` como canal general. |
| 22 | Lista de conversaciones privadas | ❌. Solo se puede pedir el historial con un usuario conocido. | `GET /api/chat/conversaciones` → `[{usuarioId, nombre, ultimoMensaje, fecha, noLeidos}]`. |

---

## P2. Otros

- **23. Datos demo (`V12`)**: que coincidan con lo que muestran los mockups para que la demo se vea completa. Por ejemplo: varias obligaciones del residente en distintos estados, paquetes pendientes, reservas pendientes por aprobar, incidencias en cada estado y algún pago manual por validar.
- **24. Paginación**: listas que van a crecer (bitácora, pagos, incidencias) deberían aceptar `?page=&size=`. No es urgente con los datos demo.
- **25. Contrato**: actualizar `API_CONTRACT.md` con cada cambio de este documento, en especial la forma de cada DTO (hoy el contrato nombra los DTO pero no lista sus campos).

---

## Lo que hará el frontend mientras tanto

Para que no se dupliquen esfuerzos:

- Proxy de Vite para `/api` en desarrollo (no necesita CORS para programar).
- Cliente HTTP con el token, manejo de errores con el formato del contrato (`codigo`, `mensaje`, `erroresCampo`) y cierre de sesión ante un 401.
- Login real con `POST /api/auth/login` y traducción de roles (`ADMINISTRADOR` → `administrador`, `PORTERO` → `porteria`, etc.) en un solo lugar.
- Conectar primero el rol **residente**, luego portería, mantenimiento y administrador. Lo que todavía no tenga endpoint seguirá usando datos de prueba hasta que esté listo.
- Pantallas nuevas para funciones que el backend ya tiene y el frontend no: **prorrateo de servicios**, **generar obligaciones del mes / marcar vencidas**, **crear usuarios, torres y apartamentos**, **subir evidencias** y **descargar el comprobante PDF**.
