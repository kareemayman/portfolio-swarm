"use client";

import { type ReactNode, useState } from "react";
import styles from "./MediaStage.module.css";

export type StageShot = {
  label: string;
  /** What the main view shows for this shot. */
  view: ReactNode;
  /** The small version in the thumbnail row. */
  thumb: ReactNode;
};

/**
 * A browser frame showing one shot, with thumbnails that switch it. The shots are
 * rendered on the server and passed in, so without JavaScript the first shot and
 * all three thumbnails are still there.
 */
export function MediaStage({ url, shots }: { url: string; shots: StageShot[] }) {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className={styles.stage} data-b="box">
        <div className={styles.chrome}>
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.url} data-b="text">
            {url}
          </span>
        </div>
        <div className={styles.view} data-b="fill">
          {shots[active].view}
        </div>
      </div>
      <div className={styles.thumbs}>
        {shots.map((shot, i) => (
          <button
            type="button"
            key={shot.label}
            aria-pressed={i === active}
            aria-label={shot.label}
            onClick={() => setActive(i)}
            data-b="chip"
          >
            <span className={styles.thumbArt}>{shot.thumb}</span>
            <span className={styles.thumbLabel} aria-hidden="true">
              {shot.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
