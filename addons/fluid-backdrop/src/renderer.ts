import { surface, type Gpu, type Surface } from "vgpu";

import { installStirInput } from "./pointer-input";
import {
  createFluid,
  prepareFluid,
  renderFluid,
  resizeFluid,
  setFluidSettings,
  stepFluid,
  type Fluid,
  type FluidSettings,
} from "./simulation";

const FIXED_STEP = 1 / 60;

interface RendererOptions {
  canvas: HTMLCanvasElement;
  /** Reglages appliques des que le solveur existe. */
  settings?: Partial<FluidSettings>;
  /** Element qui ecoute le pointeur, quand ce n'est pas le canvas. */
  surface?: HTMLElement;
}

function fixedStepCount(accumulator: number, elapsed: number) {
  let next = accumulator + Math.min(elapsed, 1 / 30);
  let steps = 0;
  while (next >= FIXED_STEP && steps < 2) {
    next -= FIXED_STEP;
    steps++;
  }
  return { steps, accumulator: steps === 2 ? 0 : next };
}

export function createRenderer(options: RendererOptions) {
  let disposed = false;
  let gpu: Gpu | undefined;
  let canvasSurface: Surface | undefined;
  let fluid: Fluid | undefined;
  let input: ReturnType<typeof installStirInput> | undefined;
  let animationFrame = 0;
  let accumulator = 0;
  let previous = 0;
  // L'init est asynchrone : ce qui arrive avant est mis de cote et applique
  // au moment ou le solveur existe.
  let pending: Partial<FluidSettings> = { ...options.settings };

  function setSettings(patch: Partial<FluidSettings>) {
    if (fluid) setFluidSettings(fluid, patch);
    else Object.assign(pending, patch);
  }

  const tick = (now: number) => {
    if (disposed) return;
    if (!document.hidden && fluid && input && canvasSurface) {
      const fixed = fixedStepCount(accumulator, (now - previous) / 1000);
      accumulator = fixed.accumulator;
      for (let i = 0; i < fixed.steps; i++) {
        stepFluid(fluid, input);
      }
      renderFluid(fluid, canvasSurface);
    }
    // Always reset the clock while hidden so visibility changes never catch up.
    previous = now;
    animationFrame = requestAnimationFrame(tick);
  };

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    input?.dispose();
    gpu?.dispose();
  }

  function fail(error: unknown): never {
    dispose();
    throw error;
  }

  const initialize = async () => {
    const { init } = await import("vgpu");
    if (disposed) return;
    const nextGpu = await init();
    if (disposed) {
      nextGpu.dispose();
      return;
    }
    gpu = nextGpu;
    canvasSurface = surface(gpu, options.canvas, { dpr: [1, 2] });
    fluid = createFluid(gpu);
    setFluidSettings(fluid, pending);
    pending = {};
    input = installStirInput(options.canvas, { surface: options.surface });
    await prepareFluid(fluid, canvasSurface);
    if (disposed) return;
    canvasSurface.onResize(() => {
      if (disposed || !fluid || !canvasSurface) return;
      try {
        resizeFluid(fluid, canvasSurface);
      } catch (error) {
        fail(error);
      }
    });
    previous = performance.now();
    animationFrame = requestAnimationFrame(tick);
  };

  const ready = initialize().catch((error: unknown) => {
    if (disposed) return;
    fail(error);
  });

  return { ready, dispose, setSettings };
}
