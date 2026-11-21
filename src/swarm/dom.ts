/* Where page elements are, for the actions that point at them. */

/** A box in document coordinates. */
export type Rect = { x: number; y: number; w: number; h: number };

/** Where `el` is right now, in document coordinates. Read it when an action starts. */
export function docRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
}

/**
 * False when the element has no box at all, as inside `display: none` at some widths.
 * Hidden build states use `visibility` and `opacity`, which still leave a box to build.
 */
export function rendered(el: Element): boolean {
  return el.getClientRects().length > 0;
}
