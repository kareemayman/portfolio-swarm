import { createAgents, type Agent } from "./agents";
import { startIdle } from "./idle";
import { Runner, type RunnerStatus } from "./runner";
import { BUILT_KEY, followSections, SWARM_READY, type SectionScript } from "./sections";
import { setSpeed } from "./time";

type Scripts = Record<string, SectionScript>;

/** What the control bar shows: where the build stands, and the visitor's speed. */
export type SwarmStatus = RunnerStatus & { speed: number };

/** What the control bar reads and does. */
export type Controls = {
  /** The same object until something in it changes, as useSyncExternalStore expects. */
  status(): SwarmStatus;
  /** Calls `listener` whenever the status changes. Returns the unsubscribe. */
  subscribe(listener: () => void): () => void;
  /** 1 or 2. */
  setSpeed(speed: number): void;
  /** Shows every section built at once. */
  skip(): void;
  /** Takes every section back to unbuilt and builds again from the top. */
  replay(): void;
};

export type Swarm = {
  /** Null when there is nothing to build, because the page already shows in full. */
  controls: Controls | null;
  /** Stops it all and empties the layer. */
  unmount(): void;
};

/**
 * Puts the swarm on the page: creates the three cursors in `layer`, starts the idle
 * loop and the runner that builds the registered sections with their `scripts`.
 */
export function mountSwarm(layer: HTMLElement, scripts: Scripts): Swarm {
  const agents = createAgents(layer);
  placeBelow(agents);
  const stopIdle = startIdle(agents);
  const building = startBuilding(layer, agents, scripts);

  return {
    controls: building?.controls ?? null,
    unmount() {
      building?.stop();
      stopIdle();
      layer.replaceChildren(); // the cursors, and any overlay still on screen
    },
  };
}

/** Just below the viewport, so the cursors drift in instead of popping up. */
function placeBelow(agents: Agent[]): void {
  agents.forEach((agent, i) => agent.set(innerWidth - 120 - i * 30, scrollY + innerHeight + 30));
}

/**
 * Builds the registered sections as they scroll into view. Without the `js` class on
 * <html> nothing is hidden, because the head script gave up waiting or reduced motion
 * took it away, so there is nothing to build.
 */
function startBuilding(
  layer: HTMLElement,
  agents: Agent[],
  scripts: Scripts,
): { controls: Controls; stop(): void } | null {
  if (!document.documentElement.classList.contains("js")) return null;
  // From here on the swarm reveals the page, so the head script stops watching over it.
  document.dispatchEvent(new Event(SWARM_READY));

  let speed = 1;
  setSpeed(speed);
  let snapshot: SwarmStatus | undefined;
  const listeners = new Set<() => void>();
  const runner = new Runner({ layer, agents, onChange: publish, memory: BUILT_KEY });

  function read(): SwarmStatus {
    return { ...runner.status, speed };
  }

  function publish(): void {
    const next = read();
    const keys = Object.keys(next) as (keyof SwarmStatus)[];
    if (snapshot && keys.every((k) => next[k] === snapshot![k])) return;
    snapshot = next;
    for (const listener of listeners) listener();
  }

  const stopFollowing = followSections({
    add(key) {
      const roots = [...document.querySelectorAll<HTMLElement>(`[data-swarm="${CSS.escape(key)}"]`)];
      if (!roots.length) console.warn(`swarm: section "${key}" has no element marked data-swarm`);
      runner.add(key, { ...scripts[key], roots });
    },
    remove: (key) => runner.remove(key),
  });

  // The first build waits for the fonts, so boxes and size locks measure the final
  // text, but never more than 1.5s. Then the cursors get a moment to drift in.
  let stopped = false;
  let timer = 0;
  void Promise.race([document.fonts.ready, wait(1500)]).then(() => {
    if (!stopped) timer = window.setTimeout(() => runner.start(), 350);
  });

  const controls: Controls = {
    status: () => (snapshot ??= read()),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSpeed(next) {
      speed = next;
      setSpeed(next);
      publish();
    },
    skip: () => runner.skipAll(),
    replay() {
      // The runner pauses, so scrolling back up queues nothing early. Then the cursors
      // come in from below and the build starts over, as on a first visit.
      runner.stop();
      runner.resetAll();
      scrollTo({ top: 0, behavior: "instant" });
      placeBelow(agents);
      clearTimeout(timer);
      timer = window.setTimeout(() => runner.start(), 250);
    },
  };

  return {
    controls,
    stop() {
      stopped = true;
      clearTimeout(timer);
      stopFollowing();
      runner.stop();
      listeners.clear();
    },
  };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
