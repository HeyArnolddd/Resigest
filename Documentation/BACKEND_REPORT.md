# Informe técnico del Backend — ResiGest

Documento de referencia para entender cómo está construido el backend: estructura,
clases, responsabilidades, base de datos, seguridad y decisiones de diseño.

---

## 1. Visión general

ResiGest es una plataforma web para administrar edificios residenciales. El backend
es una **API REST** que expone todos los casos de uso (pagos, reservas, incidencias,
portería, comunicaciones) y autentica por **JWT con roles**.

| Aspecto | Tecnología |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.1.1 |
| Persistencia | Spring Data JPA + Hibernate 7 |
| Base de datos | PostgreSQL 16 (Docker) |
| Migraciones | Flyway (V1–V13) |
| Seguridad | Spring Security 7 + JWT (jjwt) |
| PDF | openpdf |
| Documentación | Swagger / OpenAPI (springdoc) |

---

## 2. Arquitectura

### 2.1 Monolito modular

Un solo proyecto, un solo despliegue, una sola base de datos, pero **dividido en
módulos por dominio de negocio** con fronteras claras:

```
common · inmueble · usuarios · financiero · reservas · mantenimiento · porteria · comunicaciones
```

No es un monolito "blob": cada módulo tiene su dominio, su repositorio, su servicio
y su controlador. Si mañana se quisiera separar `financiero`, la frontera ya está trazada.

### 2.2 Capas dentro de cada módulo

```
HTTP → web (Controller) → service (lógica) → repository (datos) → domain (entidades) → BD
```

Regla de oro: **una capa solo depende de la que tiene debajo**. El controlador no
toca la BD; el repositorio no decide reglas de negocio; las reglas viven en la entidad
y en el servicio.

### 2.3 Patrones de diseño aplicados

| Patrón | Dónde se usa | Para qué |
|---|---|---|
| **Strategy** | `PasarelaPago`, `CanalNotificacion`, `ValidadorReserva`, `AlmacenamientoArchivos` | Intercambiar implementaciones sin tocar el servicio |
| **Eventos de dominio** | `EventoDominio` + `ManejadorEventosNotificacion` | Desacoplar módulos (p. ej. reservas → comunicaciones) |
| **Herencia JPA** | `Usuario` (JOINED), `Pago` (SINGLE_TABLE), `EntidadBase` (`@MappedSuperclass`) | Evitar duplicación y modelar variantes |
| **DTO + mapper** | Todos los módulos | Nunca exponer entidades por la API |
| **Inyección por constructor** | Todos los servicios | Facilita pruebas y evita ciclos |

---

## 3. Estructura de paquetes

Paquete base: `co.edu.uis.resigest`

```
common/
├── config/       SecurityConfig, JpaAuditingConfig
├── security/     JwtService, JwtAuthenticationFilter, UsuarioDetailsService,
│                 UsuarioAutenticado, VerificadorPropietario
├── exception/    ApiError, GlobalExceptionHandler y las excepciones de negocio
├── domain/       EntidadBase, EventoDominio
└── util/         (reservado)

inmueble/         domain · repository · service · dto · web
usuarios/         domain · repository · service · dto · mapper · web
financiero/       domain · repository · service · gateway · pdf · event · dto · web
reservas/         domain · repository · service · validation · event · dto · web
mantenimiento/    domain · repository · service · storage · dto · web
porteria/         domain · repository · service · dto · web
comunicaciones/   domain · repository · service · channel · listener · dto · web
```

---

## 4. Módulo por módulo

### 4.1 `common` — la base de todo

| Clase | Responsabilidad |
|---|---|
| `EntidadBase` | `@MappedSuperclass` con `id`, `fechaCreacion`, `fechaActualizacion` y auditoría automática. Todas las entidades la heredan. |
| `EventoDominio` | Base de los eventos en memoria (no se guardan). |
| `ApiError` | `record` con el formato único de error. |
| `GlobalExceptionHandler` | Única clase que decide códigos HTTP de error. |
| `ReglaNegocioException` / `ConflictoException` / `RecursoNoEncontradoException` / `AutenticacionException` / `AccesoDenegadoException` | Excepciones de negocio (422 / 409 / 404 / 401 / 403). |
| `JwtService` | Genera y valida tokens JWT (claim de rol, expiración 8 h). |
| `JwtAuthenticationFilter` | Lee `Authorization: Bearer`, valida y autentica. |
| `UsuarioDetailsService` / `UsuarioAutenticado` | Adaptan `Usuario` a Spring Security (`ROLE_...`). |
| `VerificadorPropietario` | Comprueba que el residente solo acceda a su apartamento (admin siempre). |
| `SecurityConfig` | Seguridad sin estado: `permitAll` para login/webhook/swagger; resto autenticado. |
| `JpaAuditingConfig` | Activa `@CreatedDate` / `@LastModifiedDate`. |

### 4.2 `inmueble` — torres y apartamentos

- **Domain:** `Torre` (nombre, numeroPisos, lista de apartamentos), `Apartamento` (numero, piso, coeficienteCopropiedad, activo, torre).
- **Reglas:** `identificadorCompleto()` → `"Torre 1 – Apto 101"`, `totalApartamentos()`.
- **Repository:** `TorreRepository`, `ApartamentoRepository` (`findByTorreIdAndNumero`, `findByActivoTrue`).
- **Service:** `TorreService`/`Impl`, `ApartamentoService`/`Impl`.
- **Web:** `TorreController`, `ApartamentoController` (+ `estado-cuenta`).

### 4.3 `usuarios` — autenticación y gestión

- **Domain (herencia JOINED):** `Usuario` abstracta (nombre, correo único, contrasenaHash, documento, telefono, activo, intentosFallidos, bloqueadoHasta) + `Residente`, `Administrador`, `Portero`, `TecnicoMantenimiento`.
- **Reglas (RF01):** `registrarIntentoFallido()` (5 intentos → bloqueo 15 min), `estaBloqueado()`, `reiniciarIntentos()`.
- **Enums:** `Rol` (RESIDENTE/ADMINISTRADOR/PORTERO/MANTENIMIENTO), `TipoResidente`.
- **Service:** `AuthService` (login con bloqueo) y `UsuarioService` (registro por rol, listar, desactivar).
- **Mapper:** `UsuarioMapper.toDto()`.
- **Web:** `AuthController` (`/api/auth/login`), `UsuarioController`.

### 4.4 `financiero` — cartera, pagos y prorrateo

- **Domain:**
  - `ObligacionFinanciera` (deuda mensual: apartamento, concepto, periodo, montoTotal, saldoPendiente, estado, fechaVencimiento). Reglas: `registrarAbono`, `marcarEnVerificacion`, `marcarVencida`, `estaSaldada`, `estaVencida`.
  - `Pago` (SINGLE_TABLE) → `PagoPasarela` (PAYU), `PagoManual` (TRANSFERENCIA). Reglas: `aprobar`, `rechazar`.
  - `FacturaServicioComun` + `DetalleProrrateo`.
  - Enums: `EstadoObligacion`, `EstadoPago`, `ConceptoCobro`, `MetodoPago`, `TipoServicio`.
- **Repository:** `ObligacionRepository`, `PagoRepository`, `FacturaServicioRepository`.
- **Service:** `CarteraService` (estado de cuenta, generar obligaciones, marcar vencidas con `@Scheduled`), `PagoService` (pasarela/manual/validación/webhook), `ProrrateoService` (preview/confirmar con ajuste de centavos), `ComprobanteService` (PDF).
- **Gateway (Strategy):** `PasarelaPago` + `PasarelaSimulada`.
- **PDF:** `GeneradorComprobantePdf` (openpdf).

### 4.5 `reservas` — zonas comunes

- **Domain:** `ZonaComun`, `Reserva` (con `@Version` para bloqueo optimista) y `EstadoReserva`.
- **Reglas:** `seSolapaCon`, `aprobar`, `rechazar`, `cancelar` (transiciones guardadas).
- **Validadores (Strategy):** `ValidadorMorosidad`, `ValidadorHorarioZona`, `ValidadorSolapamiento`, `ValidadorMaxHoras` (se inyectan como lista).
- **Service:** `ZonaComunService`, `ReservaService` (solicitar corre todos los validadores, aprobar, rechazar, cancelar).
- **Evento:** publica `ReservaResueltaEvento` al aprobar/rechazar.

### 4.6 `mantenimiento` — incidencias

- **Domain:** `Incidencia` (ciclo ABIERTA → ASIGNADA → EN_PROCESO → RESUELTA) + `EvidenciaIncidencia`.
- **Storage (Strategy):** `AlmacenamientoArchivos` + `AlmacenamientoLocal`.
- **Service:** `IncidenciaService` (reportar, agregar evidencia, asignar a técnico, resolver).

### 4.7 `porteria` — ingresos y paquetería

- **Domain:** `RegistroIngreso` (bitácora inmutable: solo registrar salida), `Paquete` (RECIBIDO → NOTIFICADO → ENTREGADO).
- **Service:** `PorteriaService`, `PaqueteService`.

### 4.8 `comunicaciones` — anuncios, notificaciones y chat

- **Domain:** `Comunicado`, `Notificacion`, `MensajeChat`, enums `TipoNotificacion`, `TipoCanal`.
- **Canales (Strategy):** `CanalEnPlataforma`, `CanalPush`.
- **Service:** `ComunicadoService`, `NotificacionService`, `ChatService`.
- **Listener:** `ManejadorEventosNotificacion` escucha eventos (`@TransactionalEventListener(AFTER_COMMIT)`) y crea notificaciones.

---

## 5. Base de datos (migraciones Flyway)

| Versión | Contenido |
|---|---|
| V1 | `torre`, `apartamento` |
| V2 | `usuario` + `residente`, `administrador`, `portero`, `tecnico_mantenimiento` (JOINED) |
| V3 | Admin de prueba (admin@resigest.com / admin123) |
| V4 | `obligacion_financiera` |
| V5 | `pago` (tabla única con discriminador `metodo`) |
| V6 | `zona_comun`, `reserva` (con `version`) |
| V7 | `incidencia`, `evidencia_incidencia` |
| V8 | `registro_ingreso`, `paquete` |
| V9 | `factura_servicio_comun`, `detalle_prorrateo` |
| V10 | `comunicado` |
| V11 | `notificacion` |
| V12 | Datos demo (torres, 10 aptos al 10%, zonas, usuarios) |
| V13 | `mensaje_chat` |

**Relaciones principales:**

```
Usuario (JOINED) ─┬─ Residente ──→ Apartamento
                  ├─ Administrador ──→ (autor de Comunicado)
                  ├─ Portero ──→ (registra RegistroIngreso)
                  └─ TecnicoMantenimiento ──→ (asignado a Incidencia)

Torre 1 ─── N Apartamento 1 ─── N ObligacionFinanciera 1 ─── N Pago
                         │
                         ├─ N DetalleProrrateo ──→ FacturaServicioComun
                         ├─ N Reserva ──→ ZonaComun
                         ├─ N RegistroIngreso / Paquete
                         └─ N Notificacion / MensajeChat (usuarios)
```

---

## 6. Seguridad

### 6.1 Flujo de login

```
POST /api/auth/login {correo, contrasena}
  → AuthServiceImpl.autenticar()
      → UsuarioRepository.findByCorreo()
      → PasswordEncoder.matches()  (BCrypt)
      → (bloqueo por intentos y cuenta activa)
      → JwtService.generarToken()  (correo + rol + 8h)
  → TokenResponse {token, rol, correo}
```

### 6.2 Flujo de una petición autenticada

```
Authorization: Bearer <token>
  → JwtAuthenticationFilter
      → JwtService.esValido / extraerCorreo
      → UsuarioDetailsService.loadUserByUsername
      → SecurityContextHolder (autenticado)
  → SecurityConfig (rutas públicas) + @PreAuthorize (rol) + VerificadorPropietario (dueño)
  → Controller → Service → Repository → BD
```

### 6.3 Matriz de permisos (resumen)

| Recurso | ADMIN | RESIDENTE | PORTERO | MANTENIMIENTO |
|---|---|---|---|---|
| Usuarios | total | solo `/me` | — | — |
| Torres/Apartamentos (crear) | sí | — | — | — |
| Cartera / pagos | total + validar | su apartamento | — | — |
| Reservas | aprobar/rechazar | solicitar/cancelar | — | — |
| Incidencias | asignar | reportar/evidencias | reportar | resolver |
| Portería | bitácora | — | registrar | — |
| Comunicados | publicar | leer | leer | leer |

### 6.4 Público sin token

`/api/auth/**`, `/api/pagos/webhook`, `/swagger-ui/**`, `/v3/api-docs/**`.

---

## 7. Manejo de errores

Todo error sale con **un solo formato** (`ApiError`):

```json
{ "timestamp": "...", "estado": 409, "codigo": "CONFLICTO",
  "mensaje": "La zona ya está reservada en ese horario", "erroresCampo": {} }
```

| Código | Cuándo |
|---|---|
| 400 | validación de DTO (ver `erroresCampo`) |
| 401 | credenciales / token inválido |
| 403 | rol insuficiente o recurso ajeno |
| 404 | no existe |
| 409 | duplicado o zona ocupada |
| 422 | regla de negocio (moroso, coeficientes ≠ 100%) |

---

## 8. Eventos de dominio (desacoplamiento)

```
ReservaServiceImpl.aprobar()
   → publica ReservaResueltaEvento (y se desentiende)
         ↓ (AFTER_COMMIT)
ManejadorEventosNotificacion (comunicaciones)
   → busca al residente → NotificacionService.notificar()
```

`reservas` no importa nada de `comunicaciones`. Lo mismo con `PagoAprobadoEvento` (financiero).
Los eventos llevan **datos planos** (no entidades) para que el listener funcione después del commit.

---

## 9. Cómo arrancar y probar

```bash
cd Backend
docker compose up -d          # PostgreSQL
./mvnw spring-boot:run        # API en :8080

./mvnw test                   # pruebas
```

- Swagger: `http://localhost:8080/swagger-ui.html`
- DB limpia con datos demo: `docker compose down -v && docker compose up -d`
- Credenciales demo (contraseña `admin123`): `admin@`, `residente@`, `portero@`, `tecnico@resigest.com`

---

## 10. Decisiones de diseño clave (y por qué)

1. **Monolito modular** en vez de microservicios: equipo de 3 personas, un semestre.
2. **`@Transactional` en servir, no en el controlador**; en `AuthServiceImpl.autenticar` **no** se usa transacción para que el contador de intentos fallidos persista aunque el login falle.
3. **`Usuario` JOINED** (tiene sentido: comparten identidad) vs **`Pago` SINGLE_TABLE** (siempre se consultan juntos y comparten casi todo).
4. **`@Version` en `Reserva`**: bloqueo optimista para que dos reservas simultáneas no choquen.
5. **Prorrateo con ajuste de centavos**: se reparte el total por coeficiente y la diferencia de redondeo va al apartamento de mayor coeficiente (las partes suman exacto).
6. **DTOs como `record`**: inmutables, nunca se filtra el hash de la contraseña.
7. **`BigDecimal` para dinero** con escala 2 y `HALF_UP`.

---

## 11. Estado de los pendientes (actualizado)

| Pendiente | Estado |
|---|---|
| Chat en tiempo real (WebSocket/STOMP) | ✅ Implementado (`/ws`, envío en `/app/chat.enviar`, recepción en `/topic/chat/{id}`). |
| Pasarela real (PayU Latam) | ✅ WebCheckout de PayU: `PayuCliente` firma la orden y confirma cada pago consultándolo en la API de PayU; la página de confirmación vuelve a consultar en vez de creerle al aviso. Por defecto usa el sandbox público de PayU (ver `API_CONTRACT.md` §13). |
| Push notifications | 🔶 Canal `CanalPush` integrado en la cadena de notificaciones (stub con log). Para push real falta integrar FCM/APNs. |
| Recuperación de contraseña | ✅ `TokenRecuperacion` (un uso, 1 h) + `POST /api/auth/recuperar` y `POST /api/auth/restablecer`. El envío de correo es simulado (log). |
| Paginación | ✅ `GET /api/usuarios` y `GET /api/incidencias` devuelven `Page` (`?page=&size=`). El resto sigue devolviendo `List`. |
| Verificación de propietario | ✅ Aplicada en estado-cuenta, obligaciones, paquetes y **cancelar reserva** (`AccesoDenegadoException` → 403). |
