"use client";

import { useEffect, useRef } from "react";

/**
 * Where React mounts the swarm. It renders the empty layer and, after first paint, loads
 * the engine with the sections' scripts and hands it the layer. They are a separate
 * chunk, so the page never waits for them and is complete without them.
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
      if (reduced.matches) {
        // Reduced motion: no cursors, and every section shows built. Stopping the runner
        // finished the section it was building; the rest were never touched.
        document.documentElement.classList.remove("js");
        return;
      }

      // The engine and every script in one go: once the swarm takes the page over, nothing
      // a hidden section needs is still downloading.
      const { mount } = await import("@/sections/swarm");
      if (mine === generation) unmount = mount(el);
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
