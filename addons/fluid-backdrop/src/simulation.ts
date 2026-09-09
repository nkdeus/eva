import type { Gpu, Target } from "vgpu";
import type { StirInput } from "./pointer-input";
import advectVelocityWgsl from "./advect-velocity.wgsl";
import curlWgsl from "./curl.wgsl";
import vorticityWgsl from "./vorticity.wgsl";
import divergenceWgsl from "./divergence.wgsl";
import pressureWgsl from "./pressure.wgsl";
import projectWgsl from "./project.wgsl";
import advectDyeWgsl from "./advect-dye.wgsl";
import displayWgsl from "./display.wgsl";
import { compute, effect, frame, pingPongStorage, storage } from "vgpu";

const GRID_SIZE = [128, 72] as const;
const DYE_SIZE = [GRID_SIZE[0] * 4, GRID_SIZE[1] * 4] as const;
const CELLS = GRID_SIZE[0] * GRID_SIZE[1];
const DYE_CELLS = DYE_SIZE[0] * DYE_SIZE[1];

export type Rgb = [number, number, number];

/**
 * Les valeurs par defaut sont exactement les constantes de l'exemple d'origine.
 * Repartir de `DEFAULT_SETTINGS` redonne le rendu de vgpu.sh au pixel pres.
 */
export interface FluidSettings {
  /** Teinte de l'emetteur A — sRGB 0..1. */
  colorA: Rgb;
  /** Teinte de l'emetteur B — sRGB 0..1. */
  colorB: Rgb;
  /** Ce que la teinture conserve d'une frame a l'autre. 1 = ne s'efface jamais. */
  dyeDissipation: number;
  /** Idem pour le champ de vitesse. */
  velocityDissipation: number;
  /** Confinement de vorticite : reinjecte les tourbillons perdus par l'advection. */
  vorticity: number;
  /** Poussee du pointeur sur la vitesse. */
  pointerForce: number;
  /** Rayon du trait, au carre. */
  splatRadius: number;
  /** Encre deposee par le pointeur. */
  ink: number;
  /** Intensite des deux emetteurs qui brassent tout seuls. 0 = fluide au repos. */
  emitterGain: number;
  /** Iterations du solveur de pression. Plus = plus incompressible, plus cher. */
  pressureIterations: number;
  /** Exposition du tonemap. */
  exposure: number;
  /** Profondeur du vignetage. */
  vignette: number;
  /** Filtre plein ecran — voir `FILTERS`. */
  filter: number;
  /** Taille de cellule du filtre, en pixels de sortie. */
  filterCell: number;
  /** Dosage du filtre : 0 = rendu d'origine, 1 = filtre pur. */
  filterAmount: number;
  /** Nombre de paliers, pour la posterisation. */
  filterLevels: number;
  /** 1 = plaque noire opaque (rendu d'origine). 0 = fond transparent, la
   *  teinture se compose sur la couleur de la page — donc sur le theme. */
  plate: number;
}

/** L'ordre fait foi : l'index est la valeur passee au shader. */
export const FILTERS = [
  "Aucun",
  "Pixels",
  "Triangles",
  "Hexagones",
  "Demi-teinte",
  "Contours",
  "Balayage",
  "Postérisation",
] as const;

export const DEFAULT_SETTINGS: FluidSettings = {
  colorA: [0.05, 0.48, 1.0],
  colorB: [1.0, 0.08, 0.55],
  dyeDissipation: 0.97,
  velocityDissipation: 0.98,
  vorticity: 20,
  pointerForce: 0.8,
  splatRadius: 0.002,
  ink: 0.35,
  emitterGain: 1,
  pressureIterations: 3,
  exposure: 1.35,
  vignette: 0.32,
  filter: 0,
  filterCell: 12,
  filterAmount: 1,
  filterLevels: 5,
  plate: 1,
};

export function createFluid(gpu: Gpu) {
  const allocated: object[] = [];
  try {
    const velocity = pingPongStorage(gpu, CELLS * 8);
    allocated.push(velocity.read, velocity.write);
    const dye = pingPongStorage(gpu, DYE_CELLS * 16);
    allocated.push(dye.read, dye.write);
    const pressure = pingPongStorage(gpu, CELLS * 4);
    allocated.push(pressure.read, pressure.write);
    const divergence = storage(gpu, CELLS * 4, "read-write");
    allocated.push(divergence);
    const curl = storage(gpu, CELLS * 4, "read-write");
    allocated.push(curl);
    const passes = createPasses(gpu);
    return {
      gpu,
      velocity,
      dye,
      pressure,
      divergence,
      curl,
      passes,
      step: 0,
      lastInputStep: -1000,
      settings: { ...DEFAULT_SETTINGS },
      outputSize: [1, 1] as [number, number],
    };
  } catch (error) {
    for (const buffer of allocated) {
      destroyBuffer(buffer);
    }
    throw error;
  }
}

export type Fluid = ReturnType<typeof createFluid>;

export function destroyFluid(fluid: Fluid): void {
  const buffers = [
    fluid.velocity.read,
    fluid.velocity.write,
    fluid.dye.read,
    fluid.dye.write,
    fluid.pressure.read,
    fluid.pressure.write,
    fluid.divergence,
    fluid.curl,
  ];
  for (const buffer of buffers) {
    destroyBuffer(buffer);
  }
}

function destroyBuffer(buffer: object) {
  (buffer as { destroy(): void }).destroy();
}

function createPasses(gpu: Gpu) {
  const withGrid = (shader: typeof advectVelocityWgsl) =>
    compute(gpu, shader, {
      set: { grid: { size: GRID_SIZE, dye_size: DYE_SIZE } },
    });
  return {
    advectVelocity: withGrid(advectVelocityWgsl),
    curl: withGrid(curlWgsl),
    vorticity: withGrid(vorticityWgsl),
    divergence: withGrid(divergenceWgsl),
    pressure: withGrid(pressureWgsl),
    project: withGrid(projectWgsl),
    advectDye: withGrid(advectDyeWgsl),
    display: effect(gpu, displayWgsl),
  };
}

export async function prepareFluid(
  fluid: Fluid,
  output: Target
): Promise<void> {
  resizeFluid(fluid, output);
  await fluid.passes.display.compile({ colors: [output.format] });
}

export function resizeFluid(fluid: Fluid, output: Target): void {
  fluid.outputSize = output.size as [number, number];
  writeDisplayConfig(fluid);
}

/**
 * `set({ config })` remplace l'uniforme entier : la taille de sortie et les
 * reglages d'affichage doivent donc partir ensemble, sinon le dernier appel
 * remet l'autre a zero.
 */
function writeDisplayConfig(fluid: Fluid): void {
  fluid.passes.display.set({
    config: {
      output_size: fluid.outputSize,
      exposure: fluid.settings.exposure,
      vignette: fluid.settings.vignette,
      mode: Math.round(fluid.settings.filter),
      cell: fluid.settings.filterCell,
      amount: fluid.settings.filterAmount,
      levels: fluid.settings.filterLevels,
      plate: fluid.settings.plate,
    },
  });
}

/**
 * Bornes de validation. Plus larges que celles des curseurs de la page : un
 * reglage importe a le droit de sortir de ce que l'interface propose, pas de
 * sortir de ce que le solveur supporte.
 */
const BOUNDS: Record<string, [number, number, boolean?]> = {
  dyeDissipation: [0, 1],
  velocityDissipation: [0, 1],
  vorticity: [0, 200],
  pointerForce: [0, 20],
  splatRadius: [0.00001, 0.5],
  ink: [0, 10],
  emitterGain: [0, 10],
  pressureIterations: [1, 40, true],
  exposure: [0.01, 20],
  vignette: [0, 1],
  filter: [0, FILTERS.length - 1, true],
  filterCell: [1, 400],
  filterAmount: [0, 1],
  filterLevels: [2, 64, true],
  plate: [0, 1],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Filtre un objet quelconque — typiquement un JSON colle par l'utilisateur —
 * en un patch de reglages sur : les cles inconnues tombent, les valeurs non
 * finies tombent, le reste est borne. Ne jette jamais.
 */
export function normalizeSettings(input: unknown): Partial<FluidSettings> {
  const out = {} as Record<string, unknown>;
  if (!input || typeof input !== "object") return out;
  const src = input as Record<string, unknown>;

  for (const key of Object.keys(BOUNDS)) {
    const [min, max, integer] = BOUNDS[key]!;
    const value = Number(src[key]);
    if (!Number.isFinite(value)) continue;
    out[key] = integer ? Math.round(clamp(value, min, max)) : clamp(value, min, max);
  }

  for (const key of ["colorA", "colorB"]) {
    const value = src[key];
    if (!Array.isArray(value) || value.length < 3) continue;
    const rgb = [Number(value[0]), Number(value[1]), Number(value[2])];
    if (!rgb.every(Number.isFinite)) continue;
    out[key] = rgb.map((v) => clamp(v, 0, 1)) as Rgb;
  }

  return out as Partial<FluidSettings>;
}

export function setFluidSettings(
  fluid: Fluid,
  patch: Partial<FluidSettings>
): void {
  Object.assign(fluid.settings, patch);
  writeDisplayConfig(fluid);
}

export function stepFluid(fluid: Fluid, input?: StirInput): void {
  if (input?.active) fluid.lastInputStep = fluid.step;
  const dynamic = inputUniforms(fluid, input);
  const p = fluid.passes;

  p.advectVelocity
    .set({
      input: dynamic,
      src: fluid.velocity.read,
      dst: fluid.velocity.write,
    })
    .dispatch(16, 9);
  fluid.velocity.swap();

  // Confinement restores the small rotating details lost by semi-Lagrangian advection.
  p.curl
    .set({ velocity: fluid.velocity.read, curl: fluid.curl })
    .dispatch(16, 9);
  p.vorticity
    .set({
      params: { strength: fluid.settings.vorticity },
      src: fluid.velocity.read,
      curl: fluid.curl,
      dst: fluid.velocity.write,
    })
    .dispatch(16, 9);
  fluid.velocity.swap();

  p.divergence
    .set({ velocity: fluid.velocity.read, divergence: fluid.divergence })
    .dispatch(16, 9);
  for (let i = 0; i < fluid.settings.pressureIterations; i++) {
    p.pressure
      .set({
        params: { decay: i === 0 ? 0.8 : 1 },
        src: fluid.pressure.read,
        divergence: fluid.divergence,
        dst: fluid.pressure.write,
      })
      .dispatch(16, 9);
    fluid.pressure.swap();
  }

  p.project
    .set({
      src: fluid.velocity.read,
      pressure: fluid.pressure.read,
      dst: fluid.velocity.write,
    })
    .dispatch(16, 9);
  fluid.velocity.swap();

  p.advectDye
    .set({
      input: dynamic,
      src: fluid.dye.read,
      velocity: fluid.velocity.read,
      dst: fluid.dye.write,
    })
    .dispatch(64, 36);
  fluid.dye.swap();
  fluid.step++;
  input?.consumeStep();
}

export function renderFluid(fluid: Fluid, output: Target): void {
  fluid.passes.display.set({ dye: fluid.dye.read });
  frame(fluid.gpu, (currentFrame) => {
    currentFrame.pass(output, fluid.passes.display);
  });
}

function inputUniforms(fluid: Fluid, input?: StirInput) {
  const time = fluid.step / 60;
  const [a, b] = idleEmitters(fluid.step);
  const sinceInput = fluid.step - fluid.lastInputStep;
  const idle =
    sinceInput < 90 ? 0.15 : 0.15 + 0.85 * Math.min(1, (sinceInput - 90) / 60);
  const ramp = Math.min(1, (fluid.step + 1) / 24);
  let pointerVelocity = input?.velocity ?? ([0, 0] as [number, number]);
  if (input?.active && Math.hypot(...pointerVelocity) < 0.02) {
    pointerVelocity = [0.16 * Math.cos(time * 5), 0.16 * Math.sin(time * 5)];
  }
  const speed = Math.hypot(...pointerVelocity);
  const direction =
    speed > 1e-4
      ? [pointerVelocity[0] / speed, pointerVelocity[1] / speed]
      : [0, 0];
  const s = fluid.settings;
  // L'original tirait la couleur du trait de la direction du geste, en tenant le
  // bleu au maximum. Ici les deux teintes sont configurables, donc la direction
  // sert a fondre de l'une vers l'autre : le geste peint en brand ou en accent
  // selon son sens, et le nuancier reste celui du theme.
  const blend = 0.5 + 0.5 * (0.7 * direction[0]! + 0.3 * direction[1]!);
  const pointerColor: [number, number, number, number] = [
    s.colorA[0] + (s.colorB[0] - s.colorA[0]) * blend,
    s.colorA[1] + (s.colorB[1] - s.colorA[1]) * blend,
    s.colorA[2] + (s.colorB[2] - s.colorA[2]) * blend,
    1,
  ];

  return {
    step: fluid.step,
    pointer_active: input?.active ? 1 : 0,
    pointer_from: input?.from ?? [0.5, 0.5],
    pointer_to: input?.to ?? [0.5, 0.5],
    pointer_velocity: pointerVelocity,
    pointer_color: pointerColor,
    idle_a: [...a, ramp * idle, 0.006],
    idle_b: [...b, ramp * idle, 0.0055],
    color_a: [...s.colorA, 1],
    color_b: [...s.colorB, 1],
    dye_dissipation: s.dyeDissipation,
    velocity_dissipation: s.velocityDissipation,
    pointer_force: s.pointerForce,
    splat_radius: s.splatRadius,
    ink: s.ink,
    emitter_gain: s.emitterGain,
  };
}

function idleEmitters(step: number): [[number, number], [number, number]] {
  const t = step / 60;
  return [
    [0.5 + 0.28 * Math.sin(0.73 * t), 0.5 + 0.22 * Math.sin(1.09 * t + 0.4)],
    [
      0.5 + 0.26 * Math.sin(0.61 * t + Math.PI),
      0.5 + 0.24 * Math.sin(0.97 * t + 2.1),
    ],
  ];
}
