---
name: ui-screenshot
description: Captura pantallazos del frontend de ResiGest (escritorio y móvil) con playwright-core y Microsoft Edge para revisar visualmente mockups y pantallas. Úsalo después de crear o cambiar una pantalla, o cuando pidan "ver", "revisar" o "capturar" la UI.
---

# UI screenshot

Requiere el dev server corriendo (`npm run dev` dentro de `Frontend/`, en segundo plano) en http://localhost:5173.

```bash
node .claude/skills/ui-screenshot/scripts/shot.mjs [opciones]
```

Opciones:
- `--url <url>` (por defecto `http://localhost:5173`)
- `--role <residente|porteria|mantenimiento|administrador>`: entra con el botón de acceso rápido de ese rol en el login.
- `--nav "<Etiqueta del menú>"`: hace clic en ese ítem del menú lateral (p. ej. `--nav "Finanzas"`).
- `--click "<texto>"`: clic adicional en un botón/enlace por su texto (se puede repetir).
- `--mobile`: viewport de 390×844 en lugar de 1440×900.
- `--full`: captura la página completa. Ojo: el contenido hace scroll dentro de `<main>`, así que para ver todo usa además `--height`.
- `--height <px>`: alto del viewport (p. ej. `--height 1700` para ver una pantalla larga completa).
- `--wait <ms>`: espera antes de capturar (por defecto 600; usa ~2000 en el login por la animación de entrada).
- `--out <ruta.png>` (por defecto en la carpeta temporal del sistema).

El script imprime la ruta del PNG y cualquier error de consola de la página. Después **lee el PNG con la herramienta Read** para revisarlo y critica el resultado contra la skill `resigest-ui` (marca #007A33, jerarquía, espaciado, estados) antes de iterar.

Para revisar una pantalla, captura escritorio **y** móvil.
