/* Where page elements are, for the actions that point at them. */

/** A box in document coordinates. */
export type Rect = { x: number; y: number; w: number; h: number };

/** Where `el` is right now, in document coordinates. Read it when an action starts. */
export function docRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
}

// What each locked element's min-height and min-width were, to put back on release.
const locks = new WeakMap<Element, { minHeight: string; minWidth: string }>();

/**
 * Holds an element at a size while its content changes, so nothing around it moves.
 * Leave out `width` to lock only the height.
 */
export function lockSize(el: HTMLElement, height: number, width?: number): void {
  if (!locks.has(el)) locks.set(el, { minHeight: el.style.minHeight, minWidth: el.style.minWidth });
  el.style.minHeight = `${height}px`;
  if (width !== undefined) el.style.minWidth = `${width}px`;
}

/** Releases a lock from lockSize, restoring what the page had. Does nothing otherwise. */
export function unlockSize(el: Element): void {
  const before = locks.get(el);
  if (!before) return;
  locks.delete(el);
  Object.assign((el as HTMLElement).style, before);
}

/**
 * False when the element has no box at all, as inside `display: none` at some widths.
 * Hidden build states use `visibility` and `opacity`, which still leave a box to build.
 */
export function rendered(el: Element): boolean {
  return el.getClientRects().length > 0;
}
