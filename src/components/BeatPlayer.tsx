"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { createBeat, type Beat } from "@/lib/beat";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";
import styles from "./BeatPlayer.module.css";

const BARS = 64;
const W = 640;
const H = 128;

// The same waveform the prototype draws: fixed heights, so it renders on the server.
const heights = Array.from({ length: BARS }, (_, i) => {
  const a = Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.17)) * 0.75 + 0.15;
  return Math.round(a * H * 0.8 * 100) / 100;
});

/**
 * The music card's waveform and play button. They sit at the top and bottom of the
 * card, so the card's text is passed through as children and stays server-rendered.
 */
export function BeatPlayer({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const bars = useRef<SVGGElement>(null);
  const beat = useRef<Beat | null>(null);

  useEffect(() => {
    // Bars up to the loop's position light up; null clears them all.
    const paint = (progress: number | null) => {
      // The loop also stops when the page is hidden behind another route, so the
      // label follows the engine instead of the last click.
      if (progress === null) setPlaying(false);
      const rects = bars.current?.children;
      if (!rects) return;
      for (let i = 0; i < rects.length; i++) {
        rects[i].toggleAttribute("data-on", progress !== null && i / BARS <= progress);
      }
    };
    const instance = createBeat(paint);
    beat.current = instance;
    return () => {
      instance.stop();
      beat.current = null;
    };
  }, []);

  return (
    <>
      <div className={styles.wave} data-b="fill">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <g ref={bars}>
            {heights.map((h, i) => (
              <rect key={i} x={i * 10 + 1} y={(H - h) / 2} width={7} height={h} />
            ))}
          </g>
        </svg>
      </div>
      {children}
      <div className={styles.row}>
        <button
          type="button"
          className={cx(ui.btn, ui.sm)}
          onClick={() => setPlaying(beat.current?.toggle() ?? false)}
          data-b="box"
        >
          <span data-b="text">{playing ? "■ Stop the loop" : "▶ Play a 4-bar loop"}</span>
        </button>
      </div>
    </>
  );
}
