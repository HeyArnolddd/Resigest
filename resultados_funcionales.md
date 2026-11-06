# Resultados de las pruebas funcionales (caja negra) — ResiGest

- **Fecha de ejecución:** 2026-11-06 14:58 (hora Colombia)
- **Sistema probado:** backend desplegado en `https://resigest-api.onrender.com` (Render, plan gratuito; base de datos Supabase)
- **Herramienta:** script Node.js v24.15.0 con `fetch`, peticiones HTTP reales sin acceso al código ni a la base de datos
- **Cuentas usadas:** administrador `admin@resigest.com`; residente con cuota pendiente `luz.cardenas@resigest.com` (Torre 1 · 103); residente al día `carolina.mendez@resigest.com` (Torre 1 · 101) para reservas; portero `oscar.villamizar@resigest.com`; técnico `jhon.pabon@resigest.com`
- Los tiempos (ms) se midieron desde el cliente e incluyen la latencia de red hasta Render.

## Resultados

| ID | Caso | Esperado | Obtenido | HTTP | Tiempo (ms) | Resultado |
|---|---|---|---|---|---|---|
| PF01 | Login admin@resigest.com | 200, token y rol ADMINISTRADOR | Token recibido, rol ADMINISTRADOR | 200 | 614 | OK |
| PF01 | Login luz.cardenas@resigest.com | 200, token y rol RESIDENTE | Token recibido, rol RESIDENTE | 200 | 510 | OK |
| PF01 | Login oscar.villamizar@resigest.com | 200, token y rol PORTERO | Token recibido, rol PORTERO | 200 | 583 | OK |
| PF01 | Login jhon.pabon@resigest.com | 200, token y rol MANTENIMIENTO | Token recibido, rol MANTENIMIENTO | 200 | 599 | OK |
| PF02 | Login con credenciales incorrectas | 401 con ApiError | ApiError: "Credenciales inválidas" | 401 | 417 | OK |
| PF03 | Residente lista usuarios (solo admin) | 403 | "No tienes permiso para realizar esta acción" | 403 | 127 | OK |
| PF03 | Listar usuarios sin token | 401 | Responde 403 sin cuerpo; no distingue "no autenticado" (401) de "sin permiso" (403) | 403 | 114 | FALLA |
| PF04 | Admin registra residente nuevo | 201 | Creado id 26, apto Torre 1 – Apto 101 | 201 | 2927 | OK |
| PF04 | Registrar el mismo correo otra vez | 409 | "Ya existe un usuario con el correo prueba.1793995096566@resigest.com" | 409 | 175 | OK |
| PF05 | Residente consulta estado de cuenta propio | 200 con obligaciones y saldo | Torre 1 – Apto 103: 1 obligaciones, saldo $1000 | 200 | 293 | OK |
| PF05 | Residente consulta estado de cuenta ajeno | 403 | Apto 1: "No tienes permiso sobre este apartamento" | 403 | 118 | OK |
| PF06 | Iniciar pago en línea (PayU) | 200 con urlCheckout, firma y referencia RG-… | Ref RG-3-A5E69D2E0C2B, $1000, firma MD5 456ea88a…, https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/ | 200 | 614 | OK |
| PF07 | Preview prorrateo con coeficientes que no suman 100 | 422 | NO EJECUTABLE sin cambiar datos: los coeficientes se leen de la BD (no van en la petición) y hoy suman 100.0000% | — | — | FALLA |
| PF07 | Preview prorrateo válido ($1.000.000 AGUA) | 200 con valores proporcionales | 10 apartamentos, suma de valores $1000000.00 (no se confirmó) | 200 | 799 | OK |
| PF08 | Residente con cuota pendiente (Luz, 103) solicita reserva | 422 por morosidad (regla del sistema) | "El apartamento tiene obligaciones pendientes o vencidas" | 422 | 293 | OK |
| PF08 | Solicitar reserva en Gimnasio (2027-01-01 14:00:00, 2 h) por carolina.mendez@resigest.com | 201 PENDIENTE | Reserva id 2, estado PENDIENTE | 201 | 501 | OK |
| PF08 | Misma franja otra vez | 409/422 por solapamiento | "La zona ya está reservada en ese horario" | 409 | 412 | OK |
| PF08 | Reserva con fin antes del inicio (las zonas no tienen horario configurado) | 422 | "La hora de fin debe ser posterior a la de inicio" | 422 | 296 | OK |
| PF08 | Reserva de 8 h (máximo permitido 6 h) | 422 | "La reserva no puede superar 6 horas" | 422 | 208 | OK |
| PF08 | Residente cancela la reserva creada | 200/204 | Cancelada | 204 | 376 | OK |
| PF09 | Admin aprueba reserva [PRUEBA] | 200 APROBADA | Estado APROBADA | 200 | 1194 | OK |
| PF09 | Aprobar la misma reserva otra vez | 409/422 | "Solo se puede aprobar una reserva PENDIENTE" | 422 | 116 | OK |
| PF09 | Cancelar la reserva aprobada (limpieza) | 200/204 | "No se puede cancelar una reserva en estado APROBADA". El sistema no permite cancelar ni rechazar una reserva APROBADA | 422 | 118 | FALLA |
| PF10 | Portero registra visitante | 201 | Ingreso id 1 | 201 | 460 | OK |
| PF10 | Registrar salida | 200/204 | Salida registrada | 204 | 137 | OK |
| PF10 | Registrar salida otra vez | 409/422 | "La salida ya fue registrada" | 422 | 123 | OK |
| PF10 | Bitácora de hoy incluye al visitante | 200 y aparece | Aparece entre 1 registros | 200 | 126 | OK |
| PF11 | Portero registra paquete para el residente | 201 | Paquete id 1 | 201 | 402 | OK |
| PF11 | Residente tiene notificación no leída nueva | 200 con notificación nueva | "Tienes un paquete" | 200 | 198 | OK |
| PF11 | Portero entrega el paquete | 200 | Estado ENTREGADO | 200 | 149 | OK |
| PF11 | Entregar el paquete otra vez | 409/422 | "El paquete ya fue entregado" | 422 | 115 | OK |
| PF12 | Residente reporta incidencia | 201 ABIERTA | Id 3, estado ABIERTA | 201 | 758 | OK |
| PF12 | Admin asigna al técnico | 200 ASIGNADA | Estado ASIGNADA | 200 | 338 | OK |
| PF12 | Técnico resuelve sin foto ni solución | 422 | "Datos inválidos" (rechazado por validación de la petición con 400, no por la regla de negocio con 422) | 400 | 387 | FALLA |
| PF12 | Técnico resuelve con solución pero sin foto | 422 | "Datos inválidos" (rechazado por validación de la petición con 400, no por la regla de negocio con 422) | 400 | 160 | FALLA |
| PF13 | Admin publica comunicado | 201 | Id 2 | 201 | 297 | OK |
| PF13 | Residente ve el comunicado | 200 y aparece | Aparece en la lista | 200 | 119 | OK |
| PF14 | Marcar notificación como leída | 200/204 y ya no está en no-leídas | Notificación 17 marcada; ya no aparece | 204 | 126 | OK |
| PF15 | Residente envía chat al admin | 201 | Mensaje guardado (id 1), pero responde 200 en vez de 201 | 200 | 150 | FALLA |
| PF15 | El mensaje aparece en la conversación | 200 y aparece | Aparece (1 mensajes) | 200 | 172 | OK |
| PF16 | 10 GET autenticados (servidor despierto) | Respuestas 200; se reporta promedio y máximo | Promedio 151 ms, máximo 299 ms, mínimo 121 ms; las 10 respondieron 200 | 200 | 151 | OK |

## Resumen

**35 de 41 verificaciones OK (85.4 %), 6 con FALLA (de ellas, 1 no ejecutable).**

| Caso | Verificaciones | OK | FALLA | Estado del caso |
|---|---|---|---|---|
| PF01 | 4 | 4 | 0 | OK |
| PF02 | 1 | 1 | 0 | OK |
| PF03 | 2 | 1 | 1 | FALLA |
| PF04 | 2 | 2 | 0 | OK |
| PF05 | 2 | 2 | 0 | OK |
| PF06 | 1 | 1 | 0 | OK |
| PF07 | 2 | 1 | 1 | FALLA |
| PF08 | 6 | 6 | 0 | OK |
| PF09 | 3 | 2 | 1 | FALLA |
| PF10 | 4 | 4 | 0 | OK |
| PF11 | 4 | 4 | 0 | OK |
| PF12 | 4 | 2 | 2 | FALLA |
| PF13 | 2 | 2 | 0 | OK |
| PF14 | 1 | 1 | 0 | OK |
| PF15 | 2 | 1 | 1 | FALLA |
| PF16 | 1 | 1 | 0 | OK |

### Detalle de PF16 (tiempos de respuesta)

- `/api/usuarios/me`: 134 ms
- `/api/comunicados`: 125 ms
- `/api/zonas-comunes`: 126 ms
- `/api/apartamentos/3/estado-cuenta`: 151 ms
- `/api/notificaciones/no-leidas`: 148 ms
- `/api/reservas`: 123 ms
- `/api/paquetes?apartamentoId=3`: 130 ms
- `/api/obligaciones?apartamentoId=3`: 299 ms
- `/api/chat/conversaciones`: 121 ms
- `/api/eventos`: 151 ms

## Observaciones

1. **PF03 (sin token → 403):** el backend responde 403 sin cuerpo a una petición sin token. Lo correcto es 401 ("no autenticado"); falta un punto de entrada de autenticación en la configuración de seguridad.
2. **PF07 (coeficientes que no suman 100):** no se puede provocar por caja negra. La petición de prorrateo solo lleva tipo, periodo y total; los coeficientes se leen de los apartamentos en la base de datos, que hoy suman exactamente 100 %. Provocarlo exigiría alterar datos reales. La regla sí está cubierta por la prueba unitaria `ProrrateoServiceImplTest.previewRechazaCoeficientesQueNoSuman100`.
3. **PF08 (fuera del horario de la zona):** las zonas comunes no tienen horario de apertura configurado en el sistema. En su lugar se probaron las validaciones de horario que sí existen: fin antes del inicio (422) y duración mayor a 6 horas (422). Se probó además la regla de morosidad: un apartamento con cuotas pendientes no puede reservar (422).
4. **PF09 (limpieza):** una reserva APROBADA no se puede cancelar ni rechazar por la API, así que la reserva de prueba (Gimnasio, apartamento 101) quedó aprobada.
5. **PF12 (resolver sin foto):** el sistema rechaza la acción, pero con 400 "Datos inválidos" (validación de la petición) y no con 422 (regla de negocio), porque la foto es obligatoria en el formato de la petición.
6. **PF15 (chat):** el mensaje se guarda y aparece en la conversación, pero `POST /api/chat` responde 200 en lugar de 201 (Created).
7. **PF06:** se generó la orden de pago firmada para PayU (sandbox) y **no se completó el pago**; la orden queda en estado INICIADO y no se muestra en el historial.

## Datos de prueba que quedaron en el sistema

- Residente **"[PRUEBA] Residente"** (`prueba.1793995096566@resigest.com`): no se pudo eliminar (el sistema responde 409, tiene registros asociados) y se **desactivó**.
- Reserva **aprobada** del Gimnasio para el apartamento 101 (no se puede cancelar por la API).
- Visitante "[PRUEBA] Visitante" (con salida registrada), paquete "[PRUEBA] Paquete" (entregado), incidencia "[PRUEBA] Incidencia" (asignada al técnico), comunicado "[PRUEBA] Comunicado", mensaje de chat "[PRUEBA]" al administrador y una orden de pago PayU sin completar.
