import type { Agent } from "../agents";
import { docRect, rendered } from "../dom";
import { click, fadeOut, overlay } from "../overlay";
import { tween, type Token } from "../time";
import { move } from "./move";

/**
 * Drags a vertical ruler guide in from the left edge of the viewport to `x`, spanning
 * `y0` to `y1`, with its position on a label, the way a designer lines things up. The
 * guide stays; the caller fades it out once whatever it lines up is done.
 */
export async function vguide(
  a: Agent,
  x: number,
  y0: number,
  y1: number,
  T: Token,
): Promise<HTMLDivElement> {
  const start = scrollX + 6;
  const grip = y0 + 60;
  await move(a, start, grip, T);
  click(a);

  const guide = overlay(a, "guide v");
  guide.style.top = `${y0}px`;
  guide.style.height = `${y1 - y0}px`;
  guide.style.left = `${start}px`;
  const label = document.createElement("span");
  label.textContent = `left edge · ${Math.round(x)}px`;
  guide.append(label);

  await tween(520, T, (e) => {
    const gx = start + (x - start) * e;
    guide.style.left = `${gx}px`;
    a.set(gx, grip);
  });
  click(a);
  return guide;
}

/**
 * Draws an element's bottom border: the cursor clicks at its bottom-left corner and runs
 * a guide line along to the right, then the element gets `.on`, which shows the border.
 */
export async function hline(a: Agent, el: Element, T: Token): Promise<void> {
  if (!rendered(el)) {
    el.classList.add("on");
    return;
  }

  const r = docRect(el);
  const y = r.y + r.h;
  await move(a, r.x, y, T);
  click(a);

  const line = overlay(a, "guide h");
  line.style.left = `${r.x}px`;
  line.style.top = `${y - 1}px`;
  await tween(620, T, (e) => {
    line.style.width = `${r.w * e}px`;
    a.set(r.x + r.w * e, y);
  });
  el.classList.add("on");
  fadeOut(line);
}
