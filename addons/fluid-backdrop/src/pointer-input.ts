export interface StirInput {
  active: boolean;
  from: [number, number];
  to: [number, number];
  velocity: [number, number];
  consumeStep(): void;
  dispose(): void;
}

export interface StirInputOptions {
  /**
   * Element qui ecoute le pointeur. Par defaut le canvas lui-meme.
   *
   * En fond de page, le canvas est sous le contenu : le texte, les liens et
   * tout ce qui se trouve au-dessus interceptent le pointeur avant lui, et le
   * fluide ne repond plus des qu'on survole un titre. Ecouter sur un conteneur
   * qui englobe la zone rend le geste continu, les evenements remontant depuis
   * les enfants.
   *
   * Une surface etrangere est seulement *observee* : ni capture de pointeur, ni
   * `touch-action`, ni `preventDefault`. Elle porte aussi les liens de la page
   * et son defilement, qui doivent continuer de fonctionner normalement.
   */
  surface?: HTMLElement;
}

export function installStirInput(
  canvas: HTMLCanvasElement,
  options: StirInputOptions = {}
): StirInput {
  const surface = options.surface ?? canvas;
  const owned = surface === canvas;

  let activePointer: number | undefined;
  let from: [number, number] = [0.5, 0.5];
  let to: [number, number] = [0.5, 0.5];
  let velocity: [number, number] = [0, 0];
  let lastTime = 0;
  let decay = 0;
  const previousTouchAction = canvas.style.touchAction;
  if (owned) canvas.style.touchAction = "none";

  const point = (event: PointerEvent): [number, number] => {
    const r = canvas.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (event.clientX - r.left) / Math.max(1, r.width))),
      Math.max(
        0,
        Math.min(1, 1 - (event.clientY - r.top) / Math.max(1, r.height))
      ),
    ];
  };

  const down = (event: PointerEvent) => {
    if (!event.isPrimary || activePointer !== undefined) return;
    if (owned) canvas.setPointerCapture(event.pointerId);
    activePointer = event.pointerId;
    from = to = point(event);
    lastTime = event.timeStamp;
    velocity = [0, 0];
    decay = 2;
  };

  const move = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    const next = point(event);
    if (lastTime === 0) {
      from = to = next;
      lastTime = event.timeStamp;
      return;
    }
    const dt = Math.max(
      0.004,
      Math.min(0.05, (event.timeStamp - lastTime) / 1000)
    );
    from = to;
    to = next;
    velocity = [
      Math.max(-2.5, Math.min(2.5, (to[0] - from[0]) / dt)),
      Math.max(-2.5, Math.min(2.5, (to[1] - from[1]) / dt)),
    ];
    lastTime = event.timeStamp;
    decay = 2;
  };

  const up = (event: PointerEvent) => {
    if (!event.isPrimary || event.pointerId !== activePointer) return;
    if (owned && canvas.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    activePointer = undefined;
    decay = 2;
  };

  const leave = () => {
    if (activePointer === undefined) {
      lastTime = 0;
      decay = 0;
    }
  };

  surface.addEventListener("pointerdown", down);
  surface.addEventListener("pointermove", move);
  surface.addEventListener("pointerup", up);
  surface.addEventListener("pointercancel", up);
  surface.addEventListener("pointerleave", leave);

  return {
    get active() {
      return activePointer !== undefined || decay > 0;
    },
    get from() {
      return from;
    },
    get to() {
      return to;
    },
    get velocity() {
      return velocity;
    },
    consumeStep() {
      from = to;
      if (activePointer === undefined && decay > 0) {
        velocity = [velocity[0] * 0.45, velocity[1] * 0.45];
        decay--;
      }
    },
    dispose() {
      surface.removeEventListener("pointerdown", down);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", up);
      surface.removeEventListener("pointercancel", up);
      surface.removeEventListener("pointerleave", leave);
      if (
        owned &&
        activePointer !== undefined &&
        canvas.hasPointerCapture?.(activePointer)
      ) {
        canvas.releasePointerCapture(activePointer);
      }
      activePointer = undefined;
      if (owned) canvas.style.touchAction = previousTouchAction;
    },
  };
}
