/** Antepone el `base` de astro.config.mjs a una ruta de public/ (necesario en GitHub Pages). */
export const withBase = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
