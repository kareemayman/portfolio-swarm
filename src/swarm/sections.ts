/* The sections on screen that the swarm builds. React registers each one while it is
   mounted and visible; the engine, which loads after first paint, follows along. This
   file imports nothing at runtime, so it ships with the page and not with the engine. */

import type { Section } from "./runner";

/** A section's script, and how the control bar names it, as in "building hero". */
export type SectionScript = Omit<Section, "roots">;

type Follower = {
  add(key: string): void;
  remove(key: string): void;
};

const mounted = new Set<string>();
let follower: Follower | null = null;

/** Hands a section to the swarm. Returns the function that takes it back. */
export function registerSection(key: string): () => void {
  mounted.add(key);
  follower?.add(key);
  return () => {
    mounted.delete(key);
    follower?.remove(key);
  };
}

/** Lets the engine follow the sections, starting with those already registered. */
export function followSections(next: Follower): () => void {
  follower = next;
  for (const key of mounted) next.add(key);
  return () => {
    if (follower === next) follower = null;
  };
}

/** The event the engine fires on `document` once it has taken over revealing the page. */
export const SWARM_READY = "swarm:ready";

/**
 * The sessionStorage key the page runner remembers built sections under. The head script
 * reads it too, so a section built earlier in the session never paints hidden.
 */
export const BUILT_KEY = "swarm:built";
