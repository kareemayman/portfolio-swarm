import type { Agent } from "./agents";

// The prototype closes a share of the gap each frame, so its cursors keep up twice as
// fast on a 120Hz screen as on 60Hz. This applies that share every 120th of a second of
// real time: the prototype's pace on Kareem's 120Hz screen, on any display.
const FRAME = 1000 / 120;

/**
 * When nothing is being built, the cursors follow the visitor's mouse, each with
 * its own offset and a small wobble. Without a mouse (touch devices) they park at
 * the right of the viewport. Returns a function that stops the loop.
 */
export function startIdle(agents: Agent[]): () => void {
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;
  let last = 0;

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse") pointer = { x: e.clientX, y: e.clientY };
  };

  const tick = (now: number) => {
    // Capped so a long pause doesn't turn into one big jump.
    const elapsed = last ? Math.min(now - last, 100) : FRAME;
    last = now;

    for (const agent of agents) {
      if (agent.busy) continue;

      let targetX: number;
      let targetY: number;
      if (pointer) {
        targetX = pointer.x + scrollX + agent.offset[0] + Math.sin(now / 700 + agent.index * 2) * 6;
        targetY = pointer.y + scrollY + agent.offset[1] + Math.cos(now / 820 + agent.index) * 6;
      } else {
        targetX = scrollX + innerWidth - 170 + agent.index * 26;
        targetY = scrollY + innerHeight * 0.6 + agent.index * 34;
      }

      // A share of the gap per FRAME, scaled by the real frame time.
      const perFrame = 0.07 + agent.index * 0.025;
      const ease = 1 - Math.pow(1 - perFrame, elapsed / FRAME);
      agent.set(agent.x + (targetX - agent.x) * ease, agent.y + (targetY - agent.y) * ease);
    }

    frame = requestAnimationFrame(tick);
  };

  const run = () => {
    if (frame) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const onVisibility = () => (document.hidden ? pause() : run());

  addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  if (!document.hidden) run();

  return () => {
    pause();
    removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
