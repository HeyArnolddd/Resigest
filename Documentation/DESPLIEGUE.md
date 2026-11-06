# Despliegue de ResiGest en Render

| Pieza | Servicio | Plan |
|---|---|---|
| Base de datos | **Supabase** (PostgreSQL, región `us-east-1`) | Gratis |
| Backend | **Render**, Web Service con Docker (región Virginia, junto a Supabase) | Gratis |
| Frontend | **Render**, Static Site | Gratis |

Todo lo describe el archivo [`render.yaml`](../render.yaml) en la raíz del repositorio: Render crea los dos servicios con un clic y los vuelve a desplegar solo cada vez que se sube un cambio a la rama `frontend`.

---

## Pasos (una sola vez)

1. Crear una cuenta en [render.com](https://render.com) con **GitHub**.
2. En Render: **New → Blueprint**. Conectar GitHub y dar acceso al repositorio (`HeyArnolddd/Resigest` o la copia propia). Elegirlo.
3. Render lee `render.yaml` y muestra los dos servicios: `resigest-api` y `resigest-app`. Pide estos valores:

   | Variable | De dónde sale |
   |---|---|
   | `DB_URL` | Igual que en `Backend/.env` |
   | `DB_USERNAME` | Igual que en `Backend/.env` |
   | `DB_PASSWORD` | Igual que en `Backend/.env` |
   | `RESIGEST_CLAVE_CREDENCIALES` | Igual que en `Backend/.env` (**debe ser la misma**, porque local y Render comparten la base de datos) |

   `JWT_SECRETO` lo genera Render solo; las demás variables ya vienen en `render.yaml`.
4. **Apply**. El primer despliegue del backend tarda ~5–10 minutos (compila con Maven dentro de Docker).
5. Cuando ambos estén en verde, abrir la URL de `resigest-app` (algo como `https://resigest-app.onrender.com`).

## Comprobar que funciona

- `https://<backend>.onrender.com/api/salud` debe responder `{"estado":"ok"}`.
- En la página, iniciar sesión con `admin@resigest.com`.

## Cosas a tener en cuenta

- **El backend gratis se duerme** tras 15 minutos sin uso; la primera visita después tarda ~1 minuto. Antes de una presentación, abrir la página unos minutos antes. Para mantenerlo despierto se puede usar un monitor gratuito (p. ej. UptimeRobot) que visite `/api/salud` cada 10 minutos.
- **CORS:** el backend acepta las URL `https://resigest-app*.onrender.com`. Si el frontend queda con otro nombre, actualizar `CORS_ORIGENES` en Render.
- **Base de datos compartida:** el backend local y el de Render usan la misma base de Supabase. Las migraciones nuevas que se prueben en local quedan aplicadas también para la versión publicada.
- **Usuarios demo:** `V3` crea `admin@resigest.com` con contraseña `admin123`. En una instancia que vayan a usar personas reales, cambiarla desde *Usuarios → Acceso*.
- **Pagos en línea (PayU):** funcionan sin configurar nada, con el sandbox público de PayU (no se cobra dinero real). `render.yaml` ya define `PAYU_URL_CONFIRMACION` para que PayU avise de los pagos que tardan (PSE). Si el backend queda con otro nombre en Render, actualizarla.
- **Archivos subidos** (fotos y comprobantes): se guardan en la base de datos, así que no se pierden al redesplegar.
