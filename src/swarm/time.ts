/* Time in the swarm. Every action runs against a token that can stop it, and every
   duration is divided by speed(). */

/**
 * What an action rejects with once its token has died. The runner expects it, so it
 * is a signal to stop, not an error.
 */
export const ABORT = Symbol("swarm abort");

/**
 * Handed to every action. The runner kills it (sets `dead`) on Skip, on Replay and
 * when a project page opens, and every action holding it stops at its next frame.
 */
export type Token = { dead: boolean };

let userSpeed = 1;

/** The visitor's pick in the control bar: 1 or 2. */
export function setSpeed(value: number): void {
  userSpeed = value;
}

/**
 * How many times faster than normal the swarm works. The runner adds its boost here
 * later (handoff section 6): faster on project pages and while sections are queued.
 */
export function speed(): number {
  return userSpeed;
}

/** Waits `ms` at normal speed, then rejects with ABORT if the token died meanwhile. */
export function sleep(ms: number, T: Token): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (T.dead ? reject(ABORT) : resolve()), ms / speed());
  });
}

/**
 * Calls `step` once per frame with the progress from 0 to 1, over `ms` at normal
 * speed. The last call always gets exactly 1. At the first frame after the token
 * dies it rejects with ABORT and stops calling `step`.
 */
export function animate(ms: number, T: Token, step: (progress: number) => void): Promise<void> {
  const duration = ms / speed();
  const start = performance.now();

  return new Promise((resolve, reject) => {
    const frame = (now: number) => {
      if (T.dead) {
        reject(ABORT);
        return;
      }
      // A frame's timestamp can be a little earlier than `start`, hence the floor at 0.
      const progress = duration > 0 ? Math.min(1, Math.max(0, (now - start) / duration)) : 1;
      step(progress);
      if (progress < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}
