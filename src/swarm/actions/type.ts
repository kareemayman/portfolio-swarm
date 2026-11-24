import type { Agent } from "../agents";
import { docRect, lockSize, rendered, unlockSize } from "../dom";
import { fadeOut, overlay } from "../overlay";
import { animate, speed, type Token } from "../time";
import { move } from "./move";

export type TypeOptions = {
  /**
   * Types in the draft font: adds the `draft` class, which the section's CSS styles.
   * The hero types its name this way, then `font` swaps in the real one.
   */
  draft?: boolean;
  /** Keeps the size locks after typing, for an element that changes again next. */
  keep?: boolean;
};

// 120 characters a second and never longer than 0.65s for one element: the prototype's
// pace on Kareem's 120Hz screen, which he prefers to the handoff's 220ms to 1300ms. The
// prototype typed a step per frame, so at 60Hz it went half as fast; this doesn't.
const CHARS_PER_SECOND = 120;
const MAX_MS = 650;

// The cursor glides after the caret instead of landing on it every frame, so fast text
// and line wraps read as one motion. Each frame it closes the gap with this time constant
// (about 95% of it within three), divided by speed() like every other duration.
const GLIDE_MS = 20;

/**
 * Types an element's text back in. A selection outline with the agent's name appears,
 * the text empties and returns character by character behind a caret in the agent's
 * color, and the cursor glides after the caret. Every text node is typed in order, so nested
 * markup such as <b> or <kbd> survives. The element gets `.on` as typing starts.
 *
 * If the token dies mid-way, the full text is back before the next paint.
 */
export async function type(
  a: Agent,
  el: HTMLElement,
  T: Token,
  { draft = false, keep = false }: TypeOptions = {},
): Promise<void> {
  // An element with no box at this width (display: none) has nothing to type into.
  if (!rendered(el)) {
    el.classList.add("on");
    return;
  }

  // Lock the size before anything changes, so nothing around the element moves while
  // it is empty. min-width has no effect on inline elements, and a draft keeps its own.
  const final = docRect(el);
  if (draft) el.classList.add("draft");
  const r = docRect(el);
  const lockWidth = !draft && getComputedStyle(el).display !== "inline";
  lockSize(el, Math.max(final.h, r.h), lockWidth ? final.w : undefined);

  const caret = document.createElement("span");
  caret.className = "swarm-caret";
  caret.setAttribute("aria-hidden", "true");
  caret.style.setProperty("--c", a.color);
  let sel: HTMLDivElement | undefined;
  let nodes: [Text, string][] = [];

  try {
    await move(a, r.x, r.y + Math.min(r.h, 40) / 2, T);

    sel = overlay(a, "sel");
    sel.style.left = `${r.x - 4}px`;
    sel.style.top = `${r.y - 4}px`;
    sel.style.width = `${Math.max(final.w, r.w) + 8}px`;
    sel.style.height = `${Math.max(final.h, r.h) + 8}px`;
    const tab = document.createElement("span");
    tab.textContent = a.label;
    sel.append(tab);

    nodes = textNodes(el);
    const starts: number[] = [];
    let total = 0;
    for (const [, text] of nodes) {
      starts.push(total);
      total += text.length;
    }

    // Moves the cursor part of the way to (x, y), by how much time passed since last frame.
    let then = performance.now();
    const follow = (x: number, y: number) => {
      const now = performance.now();
      const k = 1 - Math.exp(-((now - then) * speed()) / GLIDE_MS);
      then = now;
      a.set(a.x + (x - a.x) * k, a.y + (y - a.y) * k);
    };

    // Shows the first `count` characters, with the caret after the last one.
    const show = (count: number) => {
      let last = 0;
      nodes.forEach(([node, text], i) => {
        const value = text.slice(0, Math.max(0, count - starts[i]));
        if (node.nodeValue !== value) node.nodeValue = value;
        if (starts[i] < count) last = i;
      });
      const after = nodes[last]?.[0];
      if (!after) return;
      if (caret.previousSibling !== after) after.after(caret);
      const c = caret.getBoundingClientRect();
      if (c.height) follow(c.right + scrollX + 3, c.bottom + scrollY - 3);
    };

    show(0);
    el.classList.add("on");
    const ms = Math.min(MAX_MS, (total / CHARS_PER_SECOND) * 1000);
    await animate(ms, T, (p) => show(Math.ceil(p * total)));
  } finally {
    caret.remove();
    if (sel) fadeOut(sel);
    for (const [node, text] of nodes) if (node.nodeValue !== text) node.nodeValue = text;
    // With `keep`, the next action or the runner releases the lock (and the draft class).
    if (!keep) unlockSize(el);
  }
}

/** Types several elements one after another. */
export async function typeAll(a: Agent, els: Iterable<HTMLElement>, T: Token): Promise<void> {
  for (const el of els) await type(a, el, T);
}

/** The element's text nodes in document order, each with the text it holds now. */
function textNodes(el: Element): [Text, string][] {
  const nodes: [Text, string][] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push([n as Text, n.nodeValue ?? ""]);
  return nodes;
}
