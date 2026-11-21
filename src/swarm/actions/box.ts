import type { Agent } from "../agents";
import { docRect, rendered } from "../dom";
import { click, fadeOut, overlay } from "../overlay";
import { tween, type Token } from "../time";
import { move } from "./move";

/**
 * Builds an element's box. The cursor goes to its top-left corner, clicks and drags a
 * rectangle to the bottom-right with a live size badge, then clicks again. The
 * element gets `.on`, which shows its border and background.
 */
export async function box(a: Agent, el: Element, T: Token): Promise<void> {
  // An element with no box at this width (display: none) has nothing to draw.
  if (!rendered(el)) {
    el.classList.add("on");
    return;
  }

  const r = docRect(el);
  await move(a, r.x, r.y, T);

  const draft = overlay(a, "draft-box handles");
  const badge = document.createElement("b");
  draft.append(badge);
  draft.style.left = `${r.x}px`;
  draft.style.top = `${r.y}px`;

  // Grows the rectangle to a share of the element's size, with the cursor on its corner.
  const drag = (e: number) => {
    const w = r.w * e;
    const h = r.h * e;
    draft.style.width = `${w}px`;
    draft.style.height = `${h}px`;
    badge.textContent = `${Math.round(w)} × ${Math.round(h)}`;
    a.set(r.x + w, r.y + h);
  };

  drag(0);
  click(a);
  await tween(Math.min(720, 300 + (r.w + r.h) * 0.35), T, drag);

  el.classList.add("on");
  click(a);
  fadeOut(draft);
}
