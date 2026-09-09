// Portage vanilla du wrapper React de l'exemple `fluid` de vgpu.sh.
// L'original (`index.tsx`) monte un canvas dans un `useEffect` et rend la main
// au `dispose()` du renderer. Ici on fait la meme chose sans React, plus les
// trois garde-fous qu'une page publique reclame : support WebGPU, hors-ecran,
// et `prefers-reduced-motion`.

import { createRenderer } from "./renderer";
import {
  DEFAULT_SETTINGS,
  FILTERS,
  normalizeSettings,
  type FluidSettings,
} from "./simulation";

type Renderer = ReturnType<typeof createRenderer>;

export type FluidStatus =
  | { state: "unsupported" }
  | { state: "reduced-motion" }
  | { state: "running" }
  | { state: "paused"; reason: "offscreen" | "manual" }
  | { state: "failed"; error: unknown };

interface MountOptions {
  /** Coupe la simulation quand le canvas sort du viewport. */
  pauseOffscreen?: boolean;
  /** Respecte `prefers-reduced-motion: reduce` en refusant de demarrer. */
  respectReducedMotion?: boolean;
  /** Reglages de depart, fusionnes sur `DEFAULT_SETTINGS`. */
  settings?: Partial<FluidSettings>;
  onStatus?: (status: FluidStatus) => void;
}

// `"gpu" in navigator` ne suffit pas : la propriete peut exister et valoir
// `undefined`. Et meme truthy, `init()` echoue encore quand aucun adaptateur
// n'est disponible (GPU sur liste noire, machine virtuelle, Linux sans flag) —
// c'est pourquoi l'appelant doit traiter `failed` comme un repli, pas comme un
// bug a afficher.
export function isSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.gpu);
}

export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function mountFluid(canvas: HTMLCanvasElement, options: MountOptions = {}) {
  const {
    pauseOffscreen = true,
    respectReducedMotion = true,
    onStatus = () => {},
  } = options;

  // Les reglages vivent ici, pas dans le renderer : une reprise apres passage
  // hors-ecran reconstruit le solveur, et doit retrouver la configuration.
  const settings: FluidSettings = { ...DEFAULT_SETTINGS, ...options.settings };

  let renderer: Renderer | undefined;
  let observer: IntersectionObserver | undefined;
  let visible = true;
  let wanted = false;
  let destroyed = false;

  // Le renderer de vgpu n'expose que `ready` et `dispose` : il n'y a pas de
  // pause. Reprendre = reconstruire. La teinture repart de zero, ce qui se voit
  // a peine puisqu'elle s'estompe en continu.
  function spinUp() {
    if (destroyed || renderer) return;
    try {
      renderer = createRenderer({ canvas, settings });
      onStatus({ state: "running" });
      void renderer.ready.catch((error: unknown) => {
        tearDown();
        onStatus({ state: "failed", error });
      });
    } catch (error) {
      renderer = undefined;
      onStatus({ state: "failed", error });
    }
  }

  function tearDown() {
    renderer?.dispose();
    renderer = undefined;
  }

  function reconcile(reason: "offscreen" | "manual") {
    if (destroyed) return;
    if (wanted && visible) {
      spinUp();
    } else if (renderer) {
      tearDown();
      onStatus({ state: "paused", reason });
    }
  }

  function start() {
    if (destroyed) return;
    if (!isSupported()) return onStatus({ state: "unsupported" });
    if (respectReducedMotion && prefersReducedMotion()) {
      return onStatus({ state: "reduced-motion" });
    }
    wanted = true;
    reconcile("manual");
  }

  function stop() {
    wanted = false;
    reconcile("manual");
  }

  if (pauseOffscreen && typeof IntersectionObserver === "function") {
    observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        reconcile("offscreen");
      },
      { threshold: 0 },
    );
    observer.observe(canvas);
  }

  return {
    start,
    stop,
    settings,
    setSettings(patch: Partial<FluidSettings>) {
      Object.assign(settings, patch);
      renderer?.setSettings(patch);
    },
    isRunning: () => renderer !== undefined,
    destroy() {
      destroyed = true;
      wanted = false;
      observer?.disconnect();
      tearDown();
    },
  };
}

declare global {
  interface Window {
    EvaFluid: {
      mountFluid: typeof mountFluid;
      isSupported: typeof isSupported;
      prefersReducedMotion: typeof prefersReducedMotion;
      DEFAULT_SETTINGS: FluidSettings;
      FILTERS: typeof FILTERS;
      normalizeSettings: typeof normalizeSettings;
    };
  }
}

window.EvaFluid = {
  mountFluid,
  isSupported,
  prefersReducedMotion,
  DEFAULT_SETTINGS,
  FILTERS,
  normalizeSettings,
};
