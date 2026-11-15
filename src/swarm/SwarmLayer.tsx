"use client";

import { useEffect, useRef } from "react";

/**
 * The only place React touches the swarm. It renders the empty layer and, after
 * first paint, loads the engine and hands it the layer. The engine is a separate
 * chunk, so the page never waits for it and is complete without it.
 */
export function SwarmLayer() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let unmount: (() => void) | undefined;
    // Bumped on every change, so a slow import can tell it has been superseded.
    let generation = 0;

    const sync = async () => {
      const mine = ++generation;
      unmount?.();
      unmount = undefined;
      if (reduced.matches) return; // reduced motion: no cursors at all

      const { mountSwarm } = await import("./mount");
      if (mine === generation) unmount = mountSwarm(el);
    };

    void sync();
    reduced.addEventListener("change", sync);

    return () => {
      generation++;
      reduced.removeEventListener("change", sync);
      unmount?.();
    };
  }, []);

  return <div id="swarm" ref={layer} aria-hidden="true" />;
}
