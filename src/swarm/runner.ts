import type { Agent, AgentKey } from "./agents";
import { unlockSize } from "./dom";
import { ABORT, clearBoost, setBoost, type Token } from "./time";

/** The three agents by key, as a script destructures them: `{ fe, be, ai }`. */
export type Crew = Record<AgentKey, Agent>;

/**
 * A section's build: the actions its agents run, all holding the same token. It gets
 * the section's roots in document order.
 */
export type Script = (T: Token, crew: Crew, roots: HTMLElement[]) => Promise<void>;

/**
 * Runs one agent's part of a script, then frees that agent to follow the mouse again
 * while the others are still building. A part that was stopped frees nobody: the runner
 * already has, and another build may be using the agent by the time the part notices.
 */
export async function track(a: Agent, T: Token, part: () => Promise<void>): Promise<void> {
  try {
    await part();
  } finally {
    if (!T.dead) a.busy = false;
  }
}

export type Section = {
  /** How the control bar names it while it builds, as in "building experience table". */
  name: string;
  /** The elements the section builds. The last one is its scroll trigger. */
  roots: HTMLElement[];
  script: Script;
};

export type SectionState = "pending" | "queued" | "building" | "built";

/** Where the runner stands, for the control bar. */
export type RunnerStatus = {
  /**
   * False until start() has heard where the sections are, and again after stop(). In
   * between, a section in view is about to be queued, so "nothing building" would be wrong.
   */
  running: boolean;
  /** How many sections are registered. None means there is nothing on this page to build. */
  sections: number;
  /** The name of the section being built. */
  building: string | null;
  /** How many sections wait their turn. */
  queued: number;
  /** Every registered section is built. */
  done: boolean;
};

export type RunnerOptions = {
  /** The swarm layer, cleared of overlays when a build stops. */
  layer: HTMLElement;
  /** Freed after each section, so they go back to following the mouse. */
  agents: Agent[];
  /** Multiplies the speed while this runner builds. The project page uses 1.35. */
  boost?: number;
  /** Works 1.9 times faster while sections wait in the queue. The project page turns it off. */
  queueBoost?: boolean;
  /** Called whenever what the control bar shows may have changed. */
  onChange?: () => void;
  /**
   * The sessionStorage key to remember built sections under. A section built once in the
   * session shows built whenever it comes back; Replay forgets them.
   */
  memory?: string;
};

// A section is queued once its trigger is inside the top 82% of the viewport.
const ROOT_MARGIN = "0px 0px -18% 0px";
const QUEUE_BOOST = 1.9;

/**
 * Builds sections as they scroll into view, one at a time, in the order they arrived.
 * A section's elements are hidden by the build-state CSS until they get `.on`; the
 * section's script reveals them, and finishing a section reveals whatever is left.
 */
export class Runner {
  private readonly options: RunnerOptions;
  /** The sections built this session, kept in sessionStorage under `options.memory`. */
  private readonly remembered: Set<string>;
  private readonly crew: Crew;
  private readonly sections = new Map<string, Section & { state: SectionState }>();
  private readonly triggers = new Map<Element, string>();
  private queue: string[] = [];
  private current: string | null = null;
  /** The build in progress holds it. Each build gets a fresh one. */
  private token: Token = { dead: true };
  private io: IntersectionObserver | null = null;
  private running = false;
  /** Whether the observer has reported where the sections are since start(). */
  private placed = false;

  constructor(options: RunnerOptions) {
    this.options = options;
    this.crew = Object.fromEntries(options.agents.map((a) => [a.key, a])) as Crew;
    this.remembered = new Set(options.memory ? recall(options.memory) : []);
  }

  /** Registers a section. It waits, unbuilt, until its trigger scrolls into view. */
  add(key: string, section: Section): void {
    this.remove(key);
    this.sections.set(key, { ...section, state: "pending" });
    const trigger = section.roots.at(-1);
    if (trigger) {
      this.triggers.set(trigger, key);
      this.io?.observe(trigger);
    }
    if (this.remembered.has(key)) this.finish(key); // built earlier this session
    this.changed();
  }

  /** Forgets a section. If it was building, that build stops and the rest carry on. */
  remove(key: string): void {
    const section = this.sections.get(key);
    if (!section) return;
    const wasBuilding = this.current === key;
    if (wasBuilding) this.kill();
    this.sections.delete(key);
    this.queue = this.queue.filter((k) => k !== key);
    const trigger = section.roots.at(-1);
    if (trigger) {
      this.triggers.delete(trigger);
      this.io?.unobserve(trigger);
    }
    // The kill sent the queue back to waiting; queue again whatever is still in view.
    if (wasBuilding && this.running) this.observe();
    this.changed();
  }

  /**
   * Starts building whatever is in view, and makes this runner set the pace. Calling it
   * again re-reads the view, for example after Replay scrolls back to the top.
   */
  start(): void {
    this.running = true;
    this.placed = false;
    setBoost(this.pace);
    document.addEventListener("focusin", this.onFocus);
    this.observe();
    this.revealFocus(document.activeElement); // tabbed in before the swarm started
    this.changed();
  }

  /** Stops building. The section mid-build is finished at once; the rest wait. */
  stop(): void {
    this.running = false;
    document.removeEventListener("focusin", this.onFocus);
    this.kill();
    this.io?.disconnect();
    this.io = null;
    clearBoost(this.pace);
  }

  /** Queues a waiting section. Sections build one at a time, in the order they were queued. */
  enqueue(key: string): void {
    const section = this.sections.get(key);
    if (section?.state !== "pending") return;
    section.state = "queued";
    this.queue.push(key);
    this.changed();
    void this.pump();
  }

  /**
   * Stops the build in progress. That section is finished instantly, queued sections go
   * back to waiting, overlays are cleared and the cursors are freed.
   */
  kill(): void {
    this.token.dead = true;
    if (this.current) this.finish(this.current);
    for (const key of this.queue) {
      const section = this.sections.get(key);
      if (section) section.state = "pending";
    }
    this.queue = [];
    this.current = null;
    for (const overlay of this.options.layer.querySelectorAll(".tmp")) overlay.remove();
    this.release();
    this.changed();
  }

  /** Finishes every section at once (Skip). */
  skipAll(): void {
    this.kill();
    for (const key of this.sections.keys()) this.finish(key);
    this.changed();
  }

  /** Takes every section back to unbuilt (Replay). Call start() to build again. */
  resetAll(): void {
    this.kill();
    for (const key of this.sections.keys()) this.reset(key);
    this.changed();
  }

  /** What the control bar shows. */
  get status(): RunnerStatus {
    return {
      running: this.running && this.placed,
      sections: this.sections.size,
      building: this.current ? (this.sections.get(this.current)?.name ?? null) : null,
      queued: this.queue.length,
      done: [...this.sections.values()].every((s) => s.state === "built"),
    };
  }

  /** Where one section stands. */
  state(key: string): SectionState | undefined {
    return this.sections.get(key)?.state;
  }

  private async pump(): Promise<void> {
    if (this.current || !this.running) return;

    // A section that has left the view by its turn is finished instantly, so the
    // visitor never waits behind sections they scrolled past.
    let key: string | undefined;
    while (this.queue.length) {
      const next = this.queue.shift()!;
      if (this.inView(next)) {
        key = next;
        break;
      }
      this.finish(next);
    }
    if (!key) {
      this.changed();
      return;
    }

    // remove() takes a key out of the queue with its section, so this one is registered.
    const section = this.sections.get(key)!;
    this.current = key;
    section.state = "building";
    this.changed();
    const T: Token = { dead: false };
    this.token = T;
    let broken = false;
    try {
      await section.script(T, this.crew, section.roots);
    } catch (e) {
      if (e !== ABORT) console.error(e);
      broken = true;
    }
    if (T.dead) return; // stopped meanwhile, and kill() has tidied up
    if (broken) {
      this.finishNow(key); // its other parts are still going
      return;
    }

    this.finish(key);
    this.current = null;
    this.release();
    this.changed();
    void this.pump();
  }

  private observe(): void {
    this.io ??= new IntersectionObserver(
      (entries) => {
        this.placed = true;
        // Sections that come into view together build from the top down.
        entries.sort((a, b) => documentOrder(a.target, b.target));
        for (const entry of entries) {
          const key = this.triggers.get(entry.target);
          if (!key) continue;
          if (entry.isIntersecting) this.enqueue(key);
          // Already scrolled past, as when the page opens at #work: the visitor would
          // never see it build, and the hero's sticky nav would stay hidden.
          else if (entry.boundingClientRect.bottom < 0 && this.state(key) === "pending") {
            this.finishNow(key);
          }
        }
        this.changed(); // the first report says the runner is going, even with nothing in view
      },
      { rootMargin: ROOT_MARGIN },
    );
    // Observing afresh reports where every trigger is now, so sections in view queue up.
    for (const trigger of this.triggers.keys()) {
      this.io.unobserve(trigger);
      this.io.observe(trigger);
    }
  }

  private inView(key: string): boolean {
    const trigger = this.sections.get(key)?.roots.at(-1);
    if (!trigger) return false;
    const r = trigger.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  }

  private finish(key: string): void {
    const section = this.sections.get(key);
    if (!section) return;
    for (const el of elements(section.roots)) {
      el.classList.add("on");
      el.classList.remove("draft");
      unlockSize(el);
    }
    for (const root of section.roots) {
      for (const caret of root.querySelectorAll(".swarm-caret")) caret.remove();
      root.setAttribute("data-built", "");
    }
    section.state = "built";
    this.remember(key, true);
  }

  /** Shows one section built at once, whether it was waiting, queued or building. */
  private finishNow(key: string): void {
    const section = this.sections.get(key);
    if (!section || section.state === "built") return;
    if (this.current === key) {
      // The kill finishes it and sends the queue back to waiting, so queue again what is in view.
      this.kill();
      this.observe();
      return;
    }
    this.queue = this.queue.filter((k) => k !== key);
    this.finish(key);
    this.changed();
  }

  private readonly onFocus = (e: FocusEvent): void => this.revealFocus(e.target);

  /**
   * Hidden elements can still take keyboard focus, so a section that does is shown at
   * once, focus ring and all. A click on something already built leaves the build alone.
   */
  private revealFocus(target: EventTarget | null): void {
    if (!(target instanceof Element) || !target.matches(":focus-visible")) return;
    for (const [key, section] of this.sections) {
      if (section.roots.some((root) => root.contains(target))) this.finishNow(key);
    }
  }

  private reset(key: string): void {
    const section = this.sections.get(key);
    if (!section) return;
    for (const el of elements(section.roots)) {
      el.classList.remove("on", "draft");
      unlockSize(el);
    }
    for (const root of section.roots) root.removeAttribute("data-built");
    section.state = "pending";
    this.remember(key, false);
  }

  private remember(key: string, built: boolean): void {
    if (!this.options.memory || this.remembered.has(key) === built) return;
    if (built) this.remembered.add(key);
    else this.remembered.delete(key);
    try {
      sessionStorage.setItem(this.options.memory, JSON.stringify([...this.remembered]));
    } catch {
      // Storage can be blocked. Sections are still remembered for as long as the page is.
    }
  }

  // An arrow function, so it keeps one identity for setBoost and clearBoost.
  private readonly pace = (): number => {
    const queued = this.options.queueBoost !== false && this.queue.length > 0;
    return (this.options.boost ?? 1) * (queued ? QUEUE_BOOST : 1);
  };

  private release(): void {
    for (const agent of this.options.agents) agent.busy = false;
  }

  private changed(): void {
    this.options.onChange?.();
  }
}

/** The section keys remembered under `memory`, or none if there are none or storage is blocked. */
function recall(memory: string): string[] {
  try {
    const keys: unknown = JSON.parse(sessionStorage.getItem(memory) ?? "[]");
    return Array.isArray(keys) ? keys.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

/** Sorts elements by where they come in the document. */
function documentOrder(a: Element, b: Element): number {
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/** A section's roots and everything inside them marked with data-b. */
function elements(roots: HTMLElement[]): Element[] {
  return roots.flatMap((root) => [
    ...(root.hasAttribute("data-b") ? [root] : []),
    ...root.querySelectorAll("[data-b]"),
  ]);
}
