import type { Agent } from "../agents";
import { docRect, unlockSize } from "../dom";
import { click, fadeOut, overlay } from "../overlay";
import { sleep, type Token } from "../time";
import { move } from "./move";

const OPTIONS = ["Times New Roman · 400", "Inter · 600", "Raleway · 800"];

/**
 * Swaps an element typed in the draft font (`type` with `draft` and `keep`) to its real
 * one, through a font picker. The cursor opens the picker above the element, steps down
 * the options to Raleway 800 and clicks, and the real font comes in with a short blur.
 * It also releases the size lock that `type` kept.
 */
export async function font(a: Agent, el: HTMLElement, T: Token): Promise<void> {
  const r = docRect(el);
  await move(a, r.x + Math.min(r.w - 30, 300), r.y - 4, T);
  click(a);

  const picker = overlay(a, "pop");
  const options = OPTIONS.map((label, i) => {
    const option = document.createElement("div");
    option.className = i ? "opt" : "opt hi";
    option.textContent = label;
    picker.append(option);
    return option;
  });
  // Below and right of the cursor, but never past the right edge of the viewport.
  const right = scrollX + innerWidth - 8;
  picker.style.left = `${Math.min(a.x + 10, right - picker.offsetWidth)}px`;
  picker.style.top = `${a.y + 14}px`;

  for (let i = 1; i < options.length; i++) {
    await sleep(240, T);
    const o = docRect(options[i]);
    await move(a, o.x + o.w - 24, o.y + o.h / 2, T, 200);
    options[i - 1].classList.remove("hi");
    options[i].classList.add("hi");
  }
  await sleep(200, T);
  click(a);

  el.classList.remove("draft");
  unlockSize(el);
  el.classList.add("swarm-swap");
  setTimeout(() => el.classList.remove("swarm-swap"), 600); // the animation takes 500ms
  fadeOut(picker);
}
