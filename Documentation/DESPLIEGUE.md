# Despliegue de ResiGest

Arquitectura propuesta (todo con plan gratuito):

| Pieza | Servicio | Qué se despliega |
|---|---|---|
| Base de datos | **Supabase** (PostgreSQL) | Las tablas las crea Flyway al arrancar el backend |
| Backend | **Render** (Web Service con Docker) | `Backend/Dockerfile` |
| Frontend | **Vercel** | `Frontend/` (sitio estático de Vite) |

El backend también sirve para el equipo en desarrollo: cualquiera puede apuntar su backend local a la base de Supabase con un archivo `Backend/.env`.

---

## 1. Base de datos en Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com) (región cercana: `South America (São Paulo)` o `US East`). Guardar la contraseña de la base.
2. Ir a **Connect** (o *Project Settings → Database*) y copiar la cadena del **Session pooler**, puerto **5432**.
   - No usar *Direct connection*: suele requerir IPv6 y muchas redes no lo tienen.
   - No usar *Transaction pooler* (6543): Flyway necesita una sesión completa.
3. Pasarla a formato JDBC:

   ```
   postgresql://postgres.abcd1234:[CONTRASEÑA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```
   queda como
   ```
   DB_URL=jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
   DB_USERNAME=postgres.abcd1234
   DB_PASSWORD=[CONTRASEÑA]
   ```

No hace falta crear tablas: al arrancar, Flyway aplica las migraciones `V1…V15`.

### Usarla en desarrollo

Copiar `Backend/.env.example` como `Backend/.env`, llenar las tres variables `DB_*` y arrancar el backend como siempre (`./mvnw spring-boot:run`). `Backend/.env` está en `.gitignore`: **nunca subir credenciales al repo**.

> **Ojo con las migraciones en una base compartida.** Si alguien arranca una rama con una migración nueva, esa migración queda aplicada para todos aunque la rama no se haya fusionado. Para probar migraciones nuevas, usar la base local o un proyecto de Supabase aparte. Y nunca editar una migración que ya se aplicó.

---

## 2. Backend en Render

1. *New → Web Service*, conectar el repo `HeyArnolddd/Resigest`, rama a desplegar.
2. **Root Directory:** `Backend` · **Runtime:** Docker (usa `Backend/Dockerfile`).
3. Variables de entorno:

   | Variable | Valor |
   |---|---|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Las de Supabase (paso 1) |
   | `JWT_SECRETO` | Cadena aleatoria de 32+ caracteres |
   | `RESIGEST_CLAVE_CREDENCIALES` | Otra cadena aleatoria. Si cambia, las contraseñas guardadas del personal dejan de poder consultarse (hay que reasignarlas) |
   | `CORS_ORIGENES` | URL del frontend, p. ej. `https://resigest.vercel.app` (varias separadas por coma) |

   Para generar las cadenas aleatorias: `openssl rand -base64 48`.
4. Al desplegar, revisar el log: debe aparecer `Successfully applied N migrations` y `Started BackendApplication`.
5. Probar: `https://<servicio>.onrender.com/swagger-ui/index.html`.

El plan gratuito de Render apaga el servicio tras unos minutos sin tráfico; la primera petición después tarda ~1 minuto en responder.

---

## 3. Frontend en Vercel

1. *Add New → Project*, importar el repo.
2. **Root Directory:** `Frontend` · **Framework:** Vite (build `npm run build`, salida `dist`).
3. Variable de entorno: `VITE_API_URL` = URL del backend en Render (sin `/api` al final).
4. Desplegar y copiar la URL final en `CORS_ORIGENES` del backend (paso 2.3).

---

## Antes de abrirlo a usuarios reales

- **Usuarios demo:** las migraciones `V3` y `V12` crean `admin@resigest.com`, `residente@…`, `portero@…` y `tecnico@…` con la contraseña `admin123`. En una instancia pública hay que cambiar la del administrador apenas arranque (desde *Usuarios → Acceso*) y desactivar o eliminar las cuentas demo.
- **Archivos subidos** (evidencias de incidencias): `AlmacenamientoLocal` todavía no guarda el archivo, solo devuelve la ruta `uploads/<nombre>`. Guardarlo en el disco no serviría en Render (se borra en cada despliegue); lo indicado es una implementación de `AlmacenamientoArchivos` sobre Supabase Storage.
- **Pausa de Supabase:** el plan gratuito pausa el proyecto tras ~1 semana sin actividad; se reactiva desde el panel.
