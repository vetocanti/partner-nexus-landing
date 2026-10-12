# Partner Nexus — Landing

Sitio estático en Astro. La landing se arma solo desde `src/config/scenes.ts`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
```

## Escenas

Cada escena tiene un tramo de scroll de unos 200vh. En la primera mitad la escena queda fija con su texto. En la segunda mitad, el fondo transita a la escena siguiente. La lógica está en `src/scripts/stage.ts`.

Imágenes en `public/keyframes/`: `NN-nombre.webp` (escritorio) y `NN-nombre-768.webp` (móvil).

## Añadir un clip de video

El clip **N** cubre la transición de la escena N a la N+1. Por eso hay como máximo 6 clips: `clip-1` va de 01 a 02, y `clip-6` va de 06 a 07.

1. Copia los archivos en `public/videos/` con este nombre:
   ```
   public/videos/clip-3.webm
   public/videos/clip-3.mp4
   ```
2. Añade la ruta a la escena **de origen** (la 3, en este ejemplo) en `src/config/scenes.ts`:
   ```ts
   video: { webm: withBase('/videos/clip-3.webm'), mp4: withBase('/videos/clip-3.mp4') },
   ```

Con eso basta. Durante la transición de esa escena, el scroll controla el video (`currentTime = progreso × duración`). Si el video falla o no existe, la escena usa la transición de imagen. Con `prefers-reduced-motion` el video no se carga.

Recomendaciones para que el avance sea fluido al hacer scrub:

- El primer fotograma debe coincidir con la imagen N y el último con la imagen N+1.
- Usa la misma proporción que las imágenes (16:9 aprox.), sin audio y de 2 a 4 s.
- Pon keyframes frecuentes, porque sin ellos el seek va a saltos:
  ```sh
  ffmpeg -i origen.mov -an -vf scale=1280:-2 -c:v libvpx-vp9 -b:v 0 -crf 34 -g 6 clip-3.webm
  ffmpeg -i origen.mov -an -vf scale=1280:-2 -c:v libx264 -crf 24 -g 6 -pix_fmt yuv420p -movflags +faststart clip-3.mp4
  ```
