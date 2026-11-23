import { mountSwarm } from "@/swarm/mount";
import type { SectionScript } from "@/swarm/sections";
import { hero } from "./Hero.swarm";

/** The sections the swarm builds, by the key their roots carry in `data-swarm`. */
export const scripts = {
  hero: { name: "hero", script: hero },
} satisfies Record<string, SectionScript>;

/**
 * Mounts the engine with those scripts. `SwarmLayer` loads this file after first paint,
 * so the engine and every script arrive together.
 */
export const mount = (layer: HTMLElement) => mountSwarm(layer, scripts);
