"use client";

import { useEffect } from "react";
import type Lenis from "lenis"; // the type only: Lenis itself loads after first paint

/**
 * Smooth wheel scrolling with Lenis. It moves the page's real scroll position, so the
 * sticky nav, the swarm's observers and scrollY all keep working.
 *
 * Only with a mouse or trackpad: phones and tablets keep their own touch scrolling and
 * never download it. Not with reduced motion either, which keeps the browser's scrolling
 * as it is; Lenis comes and goes if that setting changes.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    // Bumped on every change, so a slow import can tell it has been superseded.
    let generation = 0;

    const sync = async () => {
      const mine = ++generation;
      lenis?.destroy();
      lenis = undefined;
      if (reduced.matches) return;

      const { default: Smooth } = await import("lenis");
      if (mine !== generation) return;
      lenis = new Smooth({
        lerp: 0.075,
        autoRaf: true,
        // Links to a section on this page (#work) glide there too.
        anchors: true,
        // A click through to another page (a project) stops any glide still running.
        stopInertiaOnNavigate: true,
        // Something that scrolls by itself (the console log, a sideways diagram) takes the
        // wheel while it can still scroll that way; otherwise the page glides as usual.
        allowNestedScroll: true,
      });
    };

    // Back and forward restore the page's scroll position themselves. A glide still
    // running would pull the page back to where it was heading, so drop it: stopping and
    // starting Lenis is the public way to do that.
    const onPopState = () => {
      lenis?.stop();
      lenis?.start();
    };

    void sync();
    reduced.addEventListener("change", sync);
    addEventListener("popstate", onPopState);

    return () => {
      generation++;
      reduced.removeEventListener("change", sync);
      removeEventListener("popstate", onPopState);
      lenis?.destroy();
    };
  }, []);

  return null;
}
