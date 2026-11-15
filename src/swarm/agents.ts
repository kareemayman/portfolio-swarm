/* The three agents. Each is a cursor in document coordinates, drawn inside the
   swarm layer. Nothing here knows about React. */

export type AgentKey = "fe" | "be" | "ai";

export type Agent = {
  key: AgentKey;
  label: string;
  /** A token reference such as `var(--fe)`. */
  color: string;
  /** Where the cursor's tip is, in document coordinates. */
  x: number;
  y: number;
  /** True while an action is driving the cursor. The idle loop leaves a busy agent alone. */
  busy: boolean;
  /** 0, 1 or 2. Staggers the agents so they never move in lockstep. */
  index: number;
  /** Where the cursor rests relative to the visitor's pointer. */
  offset: readonly [x: number, y: number];
  el: HTMLElement;
  set(x: number, y: number): void;
};

const SPECS = [
  { key: "fe", label: "frontend", offset: [-40, 26] },
  { key: "be", label: "backend", offset: [22, 40] },
  { key: "ai", label: "ai", offset: [40, -4] },
] as const;

const CURSOR = '<svg viewBox="0 0 24 24"><path d="M3 2.5l7.2 18 2.4-7.4 7.4-2.4z"/></svg>';

// The arrow's tip is not at the corner of its box.
const TIP_X = 3;
const TIP_Y = 2;

export function createAgents(layer: HTMLElement): Agent[] {
  return SPECS.map((spec, index) => {
    const el = document.createElement("div");
    el.className = "agent";
    el.style.setProperty("--c", `var(--${spec.key})`);
    el.innerHTML = `${CURSOR}<span class="tagname"></span>`;
    el.querySelector(".tagname")!.textContent = spec.label;
    layer.appendChild(el);

    const agent: Agent = {
      key: spec.key,
      label: spec.label,
      color: `var(--${spec.key})`,
      x: 0,
      y: 0,
      busy: false,
      index,
      offset: spec.offset,
      el,
      set(x, y) {
        agent.x = x;
        agent.y = y;
        el.style.transform = `translate(${x - TIP_X}px,${y - TIP_Y}px)`;
      },
    };
    return agent;
  });
}
