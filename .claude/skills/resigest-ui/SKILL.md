---
name: resigest-ui
description: Sistema de diseño y convenciones del frontend de ResiGest (React 19 + Vite + Tailwind CSS 4, verde institucional #007A33). Úsalo SIEMPRE antes de crear o modificar cualquier pantalla, mockup, componente o estilo dentro de Frontend/, y al mapear datos de la API a la UI.
---

# ResiGest UI

Sistema de gestión para conjuntos residenciales. Usuarios: residentes, porteros, técnicos de mantenimiento y administradores. Todo el texto de la interfaz va en **español (Colombia)**.

## Stack y reglas duras

- React 19 + Vite 8 + **Tailwind CSS 4** (config en CSS con `@theme` dentro de `Frontend/src/index.css`; NO existe `tailwind.config.js`).
- Estilos **solo con clases de Tailwind**. Nada de CSS modules, styled-components ni `style={{}}` salvo valores imposibles de expresar con utilidades.
- Iconos: `lucide-react` con `strokeWidth={2}` y tamaño `size-4` (botones) / `h-5 w-5` (tarjetas).
- Animación: `motion/react`, con moderación (ver skill `frontend-design`). Respetar `prefers-reduced-motion` (ya hay regla global).
- Combinar clases con `cn()` de `src/lib/utils.js`. Formatear dinero con `formatCOP()`.
- Lint: `npm run lint` (oxlint). Dev server: `npm run dev` (puerto 5173).

## Identidad visual

| Token | Valor | Uso |
|---|---|---|
| `brand-600` | **#007A33** | Color institucional. Botón primario, ítem activo del menú, enlaces, foco |
| `brand-700` | #00652B | Hover del primario, texto de marca sobre fondo claro |
| `brand-50` / `brand-100` | #EDFBF2 / #D3F5DF | Fondos tenues de marca, ítem activo, chips |
| `brand-200`–`500` | — | Bordes, anillos de foco (`ring-brand-200`, `focus:border-brand-500`) |
| `brand-800`–`950` | — | Superficies oscuras de marca (sidebar oscuro, hero) |
| `surface-100/200/300` | grises fríos | Fondo de la app y separaciones |
| `success` / `warning` / `danger` (+ `-bg`, `-strong`) | — | Estados. Nunca usar `brand` para "éxito" ni `emerald-*`/`green-*` sueltos |

- Contraste: blanco sobre `brand-600` ≈ 5.6:1 (AA). Texto de marca sobre blanco: `text-brand-700`.
- Neutros: escala `slate-*` de Tailwind. Texto principal `text-slate-900`, secundario `text-slate-500`.
- Tipografía: Plus Jakarta Sans Variable (ya cargada). Títulos de página `text-2xl font-bold tracking-tight`; títulos de tarjeta `text-sm font-bold`.
- Radios: `rounded-lg` por defecto; `rounded-full` solo en avatares y puntos de estado.
- No introducir colores de marca nuevos. Si hace falta un acento categórico, usar violet/sky/amber/rose con moderación.

## Componentes existentes (`src/components/ui`, importar desde `../../components/ui`)

Reutilizar antes de crear algo nuevo:
`Button` (variants: primary, secondary, ghost, danger, success, outline · sizes: sm, md, lg · prop `icon`), `IconButton`, `Card`, `CardHeader`, `StatCard` (tones: primary, success, warning, danger, violet), `PageHeader` (title, subtitle, actions), `Table`, `Modal`, `EmptyState`, `Calendar`, `Field` + `Input` / `Select` / `Textarea` / `UploadBox`, `StatusBadge`, `Avatar`.

Layout: `components/layout/Shell` (Sidebar + Navbar + `<main>`). Cada pantalla recibe `onNavigate(sectionKey)`.

## Estructura de pantallas

- Pantallas en `src/views/<rol>/<Pantalla>.jsx`, registradas en `src/views/<rol>/sections.js` y en el `nav` de `src/config/roles.js`.
- Roles del frontend ↔ roles de la API: `residente`↔`RESIDENTE`, `porteria`↔`PORTERO`, `mantenimiento`↔`MANTENIMIENTO`, `administrador`↔`ADMINISTRADOR`.
- En fase de mockups los datos vienen de `src/data/mock.js`. **Los mocks deben tener la misma forma que los DTOs de `Documentation/API_CONTRACT.md`** (mismos nombres de campo y mismos enums), para que conectar la API después sea solo reemplazar la fuente de datos.

## Enums de la API → texto en pantalla

Mostrar siempre la etiqueta en español, nunca el enum crudo. Centralizar estos mapeos (p. ej. `src/lib/labels.js`) y usarlos con `StatusBadge` (`tone` explícito):

| Campo | Enum → etiqueta (tono) |
|---|---|
| Obligación `estado` | PENDIENTE→Pendiente (warning), EN_VERIFICACION→En verificación (info), PAGADA→Pagada (success), VENCIDA→Vencida (danger) |
| Obligación `concepto` | ARRIENDO→Arriendo, CUOTA_ADMINISTRACION→Cuota de administración, SERVICIO_PUBLICO→Servicio público |
| Pago `estado` | INICIADO→Iniciado (neutral), EN_VERIFICACION→En verificación (info), APROBADO→Aprobado (success), RECHAZADO→Rechazado (danger) |
| Pago `metodo` | WOMPI→Pago en línea, TRANSFERENCIA→Transferencia |
| Reserva `estado` | PENDIENTE→Pendiente (warning), APROBADA→Aprobada (success), RECHAZADA→Rechazada (danger), CANCELADA→Cancelada (neutral) |
| Incidencia `estado` | ABIERTA→Abierta (info), ASIGNADA→Asignada (warning), EN_PROCESO→En proceso (warning), RESUELTA→Resuelta (success) |
| Incidencia `prioridad` | BAJA→Baja, MEDIA→Media, ALTA→Alta (danger) |
| Ingreso `tipo` | VISITANTE→Visitante, DOMICILIO→Domicilio |
| Paquete `estado` | RECIBIDO→Recibido (warning), NOTIFICADO→Notificado (info), ENTREGADO→Entregado (success) |
| Notificación `tipo` | RESERVA, PAGO, INCIDENCIA, INGRESO, COMUNICADO → nombre en español con icono propio |

Formatos: dinero `formatCOP`; fechas `dd/mm/aaaa` y horas `HH:mm` (24 h) con `toLocaleDateString('es-CO')`; periodos `2026-10` → "Octubre 2026".

## Calidad mínima de cada pantalla

1. Responsive hasta 360 px (sidebar colapsa a menú móvil, tablas con scroll horizontal o vista en tarjetas).
2. Estados de **carga** (skeleton), **vacío** (`EmptyState` con acción) y **error** (mensaje claro con qué pasó y qué hacer).
3. Foco de teclado visible (`focus-visible:ring-2 ring-brand-500`), `aria-label` en botones solo-icono, labels en todos los campos.
4. Copy: voz activa, oraciones en minúscula inicial normal, botones que dicen lo que hacen ("Registrar paquete", no "Enviar").
5. Verificar visualmente con la skill `ui-screenshot` antes de dar por terminada una pantalla.
