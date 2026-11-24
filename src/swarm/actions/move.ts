import type { Agent } from "../agents";
import { ABORT, animate, type Token } from "../time";

/** Cubic ease in and out: a slow start, a quick middle and a soft landing. */
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/**
 * Glides the cursor's tip to (x, y), in document coordinates, on a slight arc. Takes
 * 240 to 760ms at normal speed depending on the distance, or `ms` if given.
 *
 * Marks the agent busy, so the idle loop leaves it where it lands until whoever runs
 * the build frees it.
 */
export function move(a: Agent, x: number, y: number, T: Token, ms?: number): Promise<void> {
  // Bail out before marking it busy: after a kill, nothing would free the cursor again.
  if (T.dead) return Promise.reject(ABORT);
  a.busy = true;

  const x0 = a.x;
  const y0 = a.y;
  const dx = x - x0;
  const dy = y - y0;
  const distance = Math.hypot(dx, dy);

  // The arc bends away from the straight line by up to 60px at its middle. Agents
  // alternate sides: moving right, fe and ai arc upward and be arcs downward.
  const bow = Math.min(60, distance * 0.12) * (a.index % 2 ? 1 : -1);
  const nx = distance ? -dy / distance : 0;
  const ny = distance ? dx / distance : 0;

  return animate(ms ?? Math.min(760, Math.max(240, distance * 0.75)), T, (p) => {
    const e = easeInOut(p);
    const side = Math.sin(Math.PI * e) * bow;
    a.set(x0 + dx * e + nx * side, y0 + dy * e + ny * side);
  });
}
