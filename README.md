# ResiGest — Backend

Sistema de gestión para edificios residenciales.
Backend en **Java 17 + Spring Boot 4** con Spring Data JPA, Flyway, Spring Security (JWT) y PostgreSQL.

## Requisitos

- JDK 17 o superior
- Docker (OrbStack o Docker Desktop) para PostgreSQL

## Arranque

```bash
cd Backend

# 1. Levantar PostgreSQL
docker compose up -d

# 2. Arrancar la aplicación
./mvnw spring-boot:run
```

La API queda en `http://localhost:8080`.

## Base de datos limpia (recorrido de demostración)

Para arrancar desde cero con los datos de demostración (migraciones V1–V12):

```bash
cd Backend
docker compose down -v && docker compose up -d
./mvnw spring-boot:run
```

Flyway aplica el esquema y los datos demo automáticamente.

## Credenciales demo (contraseña: `admin123`)

| Rol | Correo |
|---|---|
| ADMINISTRADOR | `admin@resigest.com` |
| RESIDENTE | `residente@resigest.com` |
| PORTERO | `portero@resigest.com` |
| MANTENIMIENTO | `tecnico@resigest.com` |

## Autenticación

```bash
POST /api/auth/login
{ "correo": "admin@resigest.com", "contrasena": "admin123" }
```

Devuelve un token JWT. Úsalo en las demás peticiones con el header:

```
Authorization: Bearer <token>
```

## Módulos

| Módulo | Responsabilidad |
|---|---|
| `inmueble` | Torres y apartamentos |
| `usuarios` | Login JWT y gestión de usuarios |
| `financiero` | Cartera, pagos y prorrateo de servicios |
| `reservas` | Reserva de zonas comunes |
| `mantenimiento` | Incidencias |
| `porteria` | Registro de ingresos y paquetería |
| `comunicaciones` | Comunicados y notificaciones |

## Pruebas

```bash
./mvnw test
```
