import type { Agent } from "./agents";

/**
 * Adds a temporary element to the swarm layer, colored for the agent: the click
 * ripple now, and later the draft boxes, selection outlines and popovers. The `tmp`
 * class marks it for the runner, which clears them all when a build is skipped.
 */
export function overlay(a: Agent, className: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `${className} tmp`;
  el.style.setProperty("--c", a.color);
  a.layer.append(el);
  return el;
}

/** Shows a click: a ring in the agent's color that grows from the cursor's tip and fades. */
export function click(a: Agent): void {
  const ring = overlay(a, "ripple");
  ring.style.left = `${a.x}px`;
  ring.style.top = `${a.y}px`;
  setTimeout(() => ring.remove(), 600); // the animation in swarm.css takes 500ms
}
