import { createAgents } from "./agents";
import { startIdle } from "./idle";

/**
 * Puts the swarm on the page: creates the three cursors in `layer` and starts the
 * idle loop. Returns a function that removes everything it added.
 */
export function mountSwarm(layer: HTMLElement): () => void {
  const agents = createAgents(layer);

  // Start just below the viewport, so the cursors drift in instead of popping up.
  agents.forEach((agent, i) => agent.set(innerWidth - 120 - i * 30, scrollY + innerHeight + 30));

  const stopIdle = startIdle(agents);

  return () => {
    stopIdle();
    for (const agent of agents) agent.el.remove();
  };
}
