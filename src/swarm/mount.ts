import { createAgents, type Agent } from "./agents";
import { startIdle } from "./idle";
import { Runner } from "./runner";
import { followSections, SWARM_READY, type SectionScript } from "./sections";

type Scripts = Record<string, SectionScript>;

/**
 * Puts the swarm on the page: creates the three cursors in `layer`, starts the idle
 * loop and the runner that builds the registered sections with their `scripts`. Returns
 * a function that stops it all and empties the layer.
 */
export function mountSwarm(layer: HTMLElement, scripts: Scripts): () => void {
  const agents = createAgents(layer);

  // Start just below the viewport, so the cursors drift in instead of popping up.
  agents.forEach((agent, i) => agent.set(innerWidth - 120 - i * 30, scrollY + innerHeight + 30));

  const stopIdle = startIdle(agents);
  const stopBuilding = startBuilding(layer, agents, scripts);

  return () => {
    stopBuilding();
    stopIdle();
    layer.replaceChildren(); // the cursors, and any overlay still on screen
  };
}

/**
 * Builds the registered sections as they scroll into view. Without the `js` class on
 * <html> nothing is hidden, because the head script gave up waiting or reduced motion
 * took it away, so there is nothing to build.
 */
function startBuilding(layer: HTMLElement, agents: Agent[], scripts: Scripts): () => void {
  if (!document.documentElement.classList.contains("js")) return () => {};
  // From here on the swarm reveals the page, so the head script stops watching over it.
  document.dispatchEvent(new Event(SWARM_READY));

  const runner = new Runner({ layer, agents });
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

  return () => {
    stopped = true;
    clearTimeout(timer);
    stopFollowing();
    runner.stop();
  };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
