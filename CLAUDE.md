# Partner Nexus — Landing

Producto: **Partner Nexus**, SaaS B2B para minería. Convierte RCA (Resoluciones de Calificación Ambiental, en PDF) en una matriz dinámica de compromisos ambientales usando IA, y alerta antes de que se incumpla un límite.

## Reglas

- **Sitio estático.** Astro con `output: 'static'`. Nada de SSR ni adaptadores.
- **Sin frameworks de UI** (React, Vue, Svelte…) salvo que sea realmente necesario. Preferir componentes `.astro`, HTML y CSS; JS mínimo y solo donde aporte.
- **Rendimiento primero.** Cero JS por defecto, imágenes optimizadas (`astro:assets`), sin dependencias innecesarias, fuentes del sistema o autoalojadas.
- **Respetar `prefers-reduced-motion`.** Toda animación o transición debe tener alternativa sin movimiento.
- **Textos en español de Chile** (`lang="es-CL"`): tono profesional, vocabulario local del sector (RCA, SEA, SMA, titular, faena).

## Comandos

- `npm run dev` — servidor local
- `npm run build` — genera `dist/`
- `npm run preview` — sirve el build

## Estructura

- `src/config/scenes.ts`: única fuente de la landing (escenas, copy, encuadres, videos).
- `src/scripts/stage.ts`: fondo controlado por scroll. Solo escribe transform y opacity.
- La capa oscura de `Stage.astro` tiene valores medidos para contraste AA; si cambian las imágenes, vuelve a medir.
