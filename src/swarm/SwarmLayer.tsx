"use client";

import { useEffect, useRef, useState } from "react";
import { ControlBar } from "./ControlBar";
import type { Controls, Swarm } from "./mount"; // types only: the engine loads later

/**
 * Where React mounts the swarm. It renders the empty layer and, after first paint, loads
 * the engine with the sections' scripts and hands it the layer. They are a separate
 * chunk, so the page never waits for them and is complete without them. Once the swarm
 * is building, it shows the control bar too.
 */
export function SwarmLayer() {
  const layer = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState<Controls | null>(null);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let swarm: Swarm | undefined;
    // Bumped on every change, so a slow import can tell it has been superseded.
    let generation = 0;

    const sync = async () => {
      const mine = ++generation;
      if (swarm) {
        swarm.unmount();
        swarm = undefined;
        setControls(null);
      }
      if (reduced.matches) {
        // Reduced motion: no cursors, no control bar, and every section shows built.
        // Unmounting finished the section being built; the rest were never touched.
        document.documentElement.classList.remove("js");
        return;
      }

      // The engine and every script in one go: once the swarm takes the page over, nothing
      // a hidden section needs is still downloading.
      const { mount } = await import("@/sections/swarm");
      if (mine !== generation) return;
      swarm = mount(el);
      setControls(swarm.controls);
    };

    void sync();
    reduced.addEventListener("change", sync);

    return () => {
      generation++;
      reduced.removeEventListener("change", sync);
      swarm?.unmount();
    };
  }, []);

  return (
    <>
      <div id="swarm" ref={layer} aria-hidden="true" />
      {controls && <ControlBar controls={controls} />}
    </>
  );
}
