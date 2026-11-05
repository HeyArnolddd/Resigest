# Estado del backend para conectar el frontend

La mayoría de los pendientes que estaban aquí ya se resolvieron; los cambios de API están en `API_CONTRACT.md` (sección 13). El frontend sigue con datos de prueba (`Frontend/src/data/mock.js`): su conexión al API le corresponde a quien lo mantiene, y este documento sirve de guía para esa conexión.

## Resuelto

- Roles `@PreAuthorize` alineados con el enum `Rol` (el administrador ya no recibe 403), más una prueba que lo verifica.
- `/api/usuarios/me` incluye el apartamento del residente; CORS configurable; proxy de Vite.
- Filtros de incidencias, reservas, pagos, paquetes e ingresos; `PATCH /api/incidencias/{id}/inicio`.
- DTO con nombres y texto de apartamento; categoría de incidencias; guía y tamaño de paquetes; justificación de rechazo de reservas.
- Archivos reales (`/api/archivos`) para evidencias y comprobantes de pago.
- Dashboard del administrador, agenda de eventos, directorio de contactos y chat comunitario.
- Datos demo ampliados (V18) y webhook de pagos firmado.

## Pendiente

- **Conectar el frontend.** Hace falta un cliente HTTP con el token, el login real (`POST /api/auth/login` + `GET /api/usuarios/me`) y migrar las pantallas de datos de prueba al API. Los endpoints y DTO están en `API_CONTRACT.md` (sección 13).
- **Chat en tiempo real.** El backend soporta STOMP (con el token en el `CONNECT`) y también consulta por REST (`/api/chat/*`).
- **Sin endpoint todavía:** confirmar «solucionada» una incidencia, que el residente marque un paquete como recogido, rechazar una incidencia, y categoría o destinatarios en los comunicados. El pago manual no guarda banco, fecha ni referencia de la transferencia.
- **Sin pantalla en el frontend:** crear usuarios, torres y apartamentos, el prorrateo de servicios y generar las obligaciones del mes.
- **Wompi real.** El webhook usa la firma propia descrita en el contrato; hay que adaptarlo al checksum nativo de Wompi al integrar el widget.
- **Pruebas.** Faltan pruebas de integración de los filtros nuevos.
