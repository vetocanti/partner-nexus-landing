/**
 * Escenario de fondo controlado por scroll.
 *
 * Cada sección [data-scene] mide ~200vh: en la primera mitad la escena queda
 * fija; en la segunda, el fondo transita a la siguiente con p = 0 → 1.
 * Todo se calcula a partir de scrollY, así que subir o bajar da el mismo
 * resultado. Solo se escriben transform y opacity.
 */

type VideoState = 'idle' | 'ready' | 'failed';

interface Layer {
  el: HTMLElement;
  video: HTMLVideoElement | null;
  videoState: VideoState;
  seekTarget: number | null;
  // Último estado escrito, para no tocar el DOM si no cambió.
  o: number;
  s: number;
  ty: number;
  visible: boolean;
  animating: boolean;
  videoOpacity: number;
}

/** Fracción del tramo con fundido entre imagen y video en cada extremo del clip. */
const VIDEO_EDGE = 0.12;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const round = (v: number) => Math.round(v * 1000) / 1000;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initStage() {
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  const sections = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
  const dots = [...document.querySelectorAll<HTMLElement>('[data-dot]')];
  const copies = sections.map((s) => s.querySelector<HTMLElement>('[data-copy]'));
  const copyOpacity = copies.map(() => 1);
  if (!stage || !sections.length) return;

  const layers: Layer[] = [...stage.querySelectorAll<HTMLElement>('[data-layer]')].map((el, i) => ({
    el,
    video: el.querySelector('video'),
    videoState: 'idle',
    seekTarget: null,
    o: i === 0 ? 1 : 0,
    s: 1,
    ty: 0,
    visible: i === 0,
    animating: false,
    videoOpacity: 0,
  }));

  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = reduceQuery.matches;
  let tops: number[] = [];
  let heights: number[] = [];
  let activeDot = -1;

  function measure() {
    tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
    heights = sections.map((s) => s.offsetHeight);
  }

  /** Escena actual i y progreso p (0..1) de su transición a i + 1. */
  function position(y: number) {
    let i = 0;
    for (let k = sections.length - 1; k >= 0; k--) {
      if (y >= tops[k]) {
        i = k;
        break;
      }
    }
    if (i >= layers.length - 1) return { i: layers.length - 1, p: 0 };
    const local = (y - tops[i]) / heights[i];
    return { i, p: clamp01((local - 0.5) / 0.5) };
  }

  /** Carga diferida: solo la escena actual y la siguiente piden su imagen. */
  function load(j: number) {
    const layer = layers[j];
    if (!layer || layer.el.dataset.loaded !== undefined) return;
    layer.el.dataset.loaded = '';
    const source = layer.el.querySelector<HTMLSourceElement>('source[data-srcset]');
    const img = layer.el.querySelector<HTMLImageElement>('img[data-src]');
    if (source) source.srcset = source.dataset.srcset!;
    if (img) img.src = img.dataset.src!;
  }

  function initVideo(layer: Layer, current: boolean) {
    const v = layer.video;
    if (!v || layer.videoState === 'failed') return;
    if (layer.videoState === 'idle' && !v.getAttribute('src')) {
      const { videoWebm, videoMp4, poster } = layer.el.dataset;
      const src = videoWebm && v.canPlayType('video/webm') ? videoWebm : videoMp4;
      if (!src) {
        layer.videoState = 'failed';
        return;
      }
      v.muted = true;
      if (poster) v.poster = poster;
      v.addEventListener('error', () => {
        layer.videoState = 'failed';
        schedule();
      });
      v.addEventListener('loadedmetadata', () => {
        if (!Number.isFinite(v.duration) || v.duration <= 0) {
          layer.videoState = 'failed';
        } else {
          layer.videoState = 'ready';
          // iOS no pinta fotogramas al hacer seek si el video nunca se reprodujo.
          v.play().then(() => v.pause()).catch(() => {});
        }
        schedule();
      });
      v.addEventListener('seeked', () => applySeek(layer));
      v.src = src;
    }
    // La escena actual baja el clip completo para que el scrub sea fluido.
    if (current && v.preload !== 'auto') v.preload = 'auto';
  }

  function applySeek(layer: Layer) {
    const v = layer.video;
    if (!v || layer.seekTarget === null || v.seeking) return;
    if (Math.abs(v.currentTime - layer.seekTarget) > 0.01) v.currentTime = layer.seekTarget;
    layer.seekTarget = null;
  }

  function write(layer: Layer, o: number, s: number, ty: number, visible: boolean, animating: boolean, videoOpacity: number) {
    const el = layer.el;
    if (visible !== layer.visible) el.classList.toggle('is-visible', (layer.visible = visible));
    if (animating !== layer.animating) el.classList.toggle('is-animating', (layer.animating = animating));
    if (layer.video && videoOpacity !== layer.videoOpacity) layer.video.style.opacity = String((layer.videoOpacity = videoOpacity));
    if (o !== layer.o) el.style.opacity = String((layer.o = o));
    if (s !== layer.s || ty !== layer.ty) {
      layer.s = s;
      layer.ty = ty;
      el.style.transform = s === 1 && ty === 0 ? '' : `translate3d(0, ${ty}%, 0) scale(${s})`;
    }
  }

  function render() {
    const { i, p } = position(window.scrollY);
    load(i);
    load(i + 1);

    const current = layers[i];
    if (!reduce && current.video) initVideo(current, true);
    if (!reduce && layers[i + 1]?.video) initVideo(layers[i + 1], false);
    const useVideo = !reduce && current.videoState === 'ready';
    const e = Math.round(ease(p) * 10000) / 10000;

    layers.forEach((layer, j) => {
      if (reduce) {
        // Cambio directo a mitad del tramo, sin zoom ni fundido.
        const shown = j === (p >= 0.5 ? i + 1 : i);
        write(layer, shown ? 1 : 0, 1, 0, shown, false, 0);
      } else if (j === i && useVideo) {
        // El video entra sobre la imagen N y, al final, la imagen N+1 entra sobre el video.
        // Si el clip calza fotograma a fotograma con las imágenes, el fundido no se nota.
        write(layer, 1, 1, 0, true, false, round(clamp01(p / VIDEO_EDGE)));
      } else if (j === i + 1 && useVideo) {
        const o = round(clamp01((p - (1 - VIDEO_EDGE)) / VIDEO_EDGE));
        write(layer, o, 1, 0, o > 0, o > 0 && o < 1, 0);
      } else if (j === i) {
        write(layer, 1 - e, 1 + 0.08 * e, -3 * e, true, p > 0 && p < 1, 0);
      } else if (j === i + 1) {
        write(layer, e, 1.06 - 0.06 * e, 0, p > 0, p > 0 && p < 1, 0);
      } else {
        write(layer, 0, 1, 0, false, false, 0);
      }
    });

    if (useVideo && current.video) {
      current.seekTarget = p * current.video.duration;
      applySeek(current);
    }

    // El texto saliente se desvanece al inicio de la transición, antes de llegar al header.
    copies.forEach((c, k) => {
      const o = !reduce && k === i ? Math.round((1 - clamp01(p / 0.35)) * 1000) / 1000 : 1;
      if (c && o !== copyOpacity[k]) c.style.opacity = String((copyOpacity[k] = o));
    });

    const dot = p >= 0.5 ? i + 1 : i;
    if (dot !== activeDot) {
      dots.forEach((d, k) => (k === dot ? d.setAttribute('aria-current', 'step') : d.removeAttribute('aria-current')));
      activeDot = dot;
    }
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  }

  measure();
  render();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    schedule();
  });
  window.addEventListener('load', () => {
    measure();
    schedule();
  });
  reduceQuery.addEventListener('change', (ev) => {
    reduce = ev.matches;
    layers.forEach((l) => l.video?.pause());
    schedule();
  });
}
