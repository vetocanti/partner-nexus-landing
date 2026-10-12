import { site } from './site';
import { withBase } from './paths';

export interface SceneVideo {
  webm: string;
  mp4: string;
}

export interface SceneCta {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

export interface Scene {
  id: string;
  /** Versión de escritorio (.webp) y versión móvil de 768 px (-768.webp). */
  image: string;
  imageMobile: string;
  /** Dimensiones intrínsecas de la imagen de escritorio. */
  width: number;
  height: number;
  objectPositionDesktop: string;
  objectPositionMobile: string;
  /** Clip de la transición de esta escena a la siguiente. */
  video?: SceneVideo;
  eyebrow: string;
  title: string;
  /** Fragmento del título que se destaca como dato (cian, mono). */
  titleHighlight?: string;
  body: string;
  cta?: SceneCta;
  widget?: 'estado-limite';
}

const keyframe = (name: string) => ({
  image: withBase(`/keyframes/${name}.webp`),
  imageMobile: withBase(`/keyframes/${name}-768.webp`),
});

export const scenes: Scene[] = [
  {
    id: 'inicio',
    ...keyframe('01-rajo-malla'),
    width: 1024,
    height: 572,
    objectPositionDesktop: '50% 50%',
    objectPositionMobile: '46% 50%',
    video: { webm: withBase('/videos/clip-1.webm'), mp4: withBase('/videos/clip-1.mp4') },
    eyebrow: 'Cumplimiento ambiental para minería',
    title: 'Tu RCA deja de ser un PDF.',
    body: 'Partner Nexus convierte la resolución en una matriz de compromisos viva: cada obligación con su límite, su plazo y su responsable.',
    cta: { label: 'Ver cómo funciona', href: '#problema', variant: 'secondary' },
  },
  {
    id: 'problema',
    ...keyframe('02-escritorio'),
    width: 1024,
    height: 572,
    objectPositionDesktop: '62% 50%',
    objectPositionMobile: '55% 50%',
    video: { webm: withBase('/videos/clip-2.webm'), mp4: withBase('/videos/clip-2.mp4') },
    eyebrow: 'El problema',
    title: 'Una RCA de 400 páginas son semanas ordenando compromisos a mano.',
    body: 'Las obligaciones quedan repartidas entre considerandos, anexos y adendas. Pasarlas a una planilla toma semanas, y cada modificación obliga a revisar todo de nuevo.',
  },
  {
    id: 'ingesta',
    ...keyframe('03-ingesta-ia'),
    width: 1024,
    height: 572,
    objectPositionDesktop: '50% 50%',
    objectPositionMobile: '38% 50%',
    video: { webm: withBase('/videos/clip-3.webm'), mp4: withBase('/videos/clip-3.mp4') },
    eyebrow: 'Ingesta con IA',
    title: 'Diseñado para pasar del PDF a compromisos ordenados en horas.',
    body: 'La IA extrae cada compromiso y lo clasifica por obligación, frecuencia, límite y responsable. Tu equipo valida cada paso antes de que entre a la matriz.',
  },
  {
    id: 'matriz',
    ...keyframe('04-sala-control'),
    width: 1024,
    height: 559,
    objectPositionDesktop: '50% 45%',
    objectPositionMobile: '70% 50%',
    eyebrow: 'Matriz de compromisos',
    title: 'Todo el cumplimiento en un solo lugar.',
    body: 'Responsables, fechas de vencimiento y gestor de evidencias conectados a cada compromiso. Sin planillas paralelas ni respaldos perdidos en el correo.',
  },
  {
    id: 'alertas',
    ...keyframe('05-estacion'),
    width: 1024,
    height: 572,
    objectPositionDesktop: '50% 55%',
    objectPositionMobile: '30% 50%',
    eyebrow: 'Alertas preventivas',
    title: 'Diseñado para avisarte al 85 % del límite, no cuando la norma ya se rompió.',
    titleHighlight: '85 %',
    body: 'Cada medición se compara con el límite de la RCA. Cuando un parámetro se acerca al umbral, el responsable recibe la alerta con tiempo para actuar.',
    widget: 'estado-limite',
  },
  {
    id: 'gis',
    ...keyframe('06-poligonos'),
    width: 1024,
    height: 572,
    objectPositionDesktop: '50% 50%',
    objectPositionMobile: '50% 50%',
    eyebrow: 'Restricciones por polígono',
    title: 'Cada restricción, en su lugar del mapa.',
    body: 'Las restricciones ambientales se asignan a los polígonos de la faena y se ven sobre el mapa de la operación, exclusivas para cada área.',
  },
  {
    id: 'reportes',
    ...keyframe('07-atardecer-red'),
    width: 1024,
    height: 572,
    objectPositionDesktop: '50% 50%',
    objectPositionMobile: '40% 50%',
    eyebrow: 'Reportes para la SMA',
    title: 'El dossier para la SMA, sin armarlo a mano.',
    body: 'Partner Nexus reúne compromisos, mediciones y evidencias en un dossier generado de forma automática, diseñado para el formato que exige la Superintendencia.',
    cta: { label: site.pilotLabel, href: site.pilotHref, variant: 'primary' },
  },
];
