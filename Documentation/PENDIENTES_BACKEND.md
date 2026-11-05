# Estado de la integración frontend ↔ backend

La mayoría de los pendientes que estaban aquí ya se resolvieron; los cambios de API están en `API_CONTRACT.md` (sección 13). Todas las pantallas de los cuatro roles consumen el API; `Frontend/src/data/mock.js` ya no existe.

## Resuelto

- Roles `@PreAuthorize` alineados con el enum `Rol` (el administrador ya no recibe 403), más una prueba que lo verifica.
- `/api/usuarios/me` incluye el apartamento del residente; CORS configurable; proxy de Vite.
- Filtros de incidencias, reservas, pagos, paquetes e ingresos; `PATCH /api/incidencias/{id}/inicio`.
- DTO con nombres y texto de apartamento; categoría de incidencias; guía y tamaño de paquetes; justificación de rechazo de reservas.
- Archivos reales (`/api/archivos`) para evidencias y comprobantes de pago.
- Dashboard del administrador, agenda de eventos, directorio de contactos y chat comunitario.
- Datos demo ampliados (V18) y webhook de pagos firmado.

## Pendiente

- **Fotos de las incidencias en pantalla.** El API ya devuelve las URLs en `evidencias[]`, pero ninguna vista las muestra todavía.
- **Chat en tiempo real con STOMP.** El backend lo soporta; la pantalla de Comunidad consulta cada 4 segundos. Falta el cliente STOMP si se quiere inmediatez.
- **Administrador.** Crear usuarios, torres y apartamentos, el prorrateo de servicios y «generar obligaciones del mes» tienen endpoint pero no pantalla. Los comunicados no guardan categoría ni destinatarios.
- **Residente.** No puede confirmar «solucionada» una incidencia ni marcar un paquete como recogido (no hay endpoint). La pantalla de pagos manuales no guarda el banco ni la fecha de la transferencia.
- **Wompi real.** El webhook usa la firma propia descrita en el contrato; hay que adaptarlo al checksum nativo de Wompi al integrar el widget.
- **Pruebas.** Faltan pruebas de integración de los filtros nuevos y pruebas automatizadas del frontend.
