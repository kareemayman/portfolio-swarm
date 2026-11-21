import type { Agent } from "../agents";
import { docRect, rendered } from "../dom";
import { fadeOut, overlay } from "../overlay";
import { animate, type Token } from "../time";
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

// 60 characters a second, and never longer than 1.3s for one element. That is the
// prototype's pace on a 60Hz screen; it typed per frame, so faster screens typed faster.
const CHARS_PER_SECOND = 60;
const MAX_MS = 1300;

/**
 * Types an element's text back in. A selection outline with the agent's name appears,
 * the text empties and returns character by character behind a caret in the agent's
 * color, and the cursor follows the caret. Every text node is typed in order, so nested
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
  el.style.minHeight = `${Math.max(final.h, r.h)}px`;
  if (!draft && getComputedStyle(el).display !== "inline") el.style.minWidth = `${final.w}px`;

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
      if (c.height) a.set(c.right + scrollX + 3, c.bottom + scrollY - 3);
    };

    show(0);
    el.classList.add("on");
    await animate(Math.min(MAX_MS, (total / CHARS_PER_SECOND) * 1000), T, (p) =>
      show(Math.ceil(p * total)),
    );
  } finally {
    caret.remove();
    if (sel) fadeOut(sel);
    for (const [node, text] of nodes) if (node.nodeValue !== text) node.nodeValue = text;
    // With `keep`, the next action or the runner releases the locks (and the draft class).
    if (!keep) {
      el.style.minHeight = "";
      el.style.minWidth = "";
    }
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
