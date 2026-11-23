"use client";

import { useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";
import type { Controls, SwarmStatus } from "./mount"; // types only: the engine loads later
import styles from "./ControlBar.module.css";

const SPEEDS = [1, 2];

/** Where the build stands, in the prototype's words. */
function describe(s: SwarmStatus): string {
  if (!s.running) return "agents warming up";
  if (s.building) return `building ${s.building}${s.queued ? ` · ${s.queued} queued, going faster` : ""}`;
  return s.done ? "all sections built" : "scroll to keep building";
}

/**
 * The build controls at the bottom right: where the build stands, 1× or 2×, Skip and
 * Replay. It exists only while the swarm builds the page, so never with reduced motion
 * or JavaScript off, and it stays out of the way on a page with nothing to build.
 */
export function ControlBar({ controls }: { controls: Controls }) {
  const status = useSyncExternalStore(controls.subscribe, controls.status, controls.status);
  if (!status.sections) return null;

  const busy = !status.running || status.building !== null;
  return (
    <div className={styles.bar} role="group" aria-label="Build controls">
      <span className={cx(styles.status, busy && styles.busy, !busy && status.done && styles.done)}>
        <i />
        <span>{describe(status)}</span>
      </span>
      <span className={styles.sep} />
      <span className={styles.speeds}>
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            aria-pressed={status.speed === speed}
            onClick={() => controls.setSpeed(speed)}
          >
            {speed}×
          </button>
        ))}
      </span>
      <button type="button" onClick={() => controls.skip()}>
        Skip
      </button>
      <button type="button" onClick={() => controls.replay()}>
        Replay
      </button>
    </div>
  );
}
