import type { Agent } from "./agents";
import { unlockSize } from "./dom";
import { ABORT, clearBoost, setBoost, type Token } from "./time";

/** A section's build: the actions its agents run, all holding the same token. */
export type Script = (T: Token) => Promise<void>;

export type Section = {
  /** How the control bar names it while it builds, as in "building experience table". */
  name: string;
  /** The elements the section builds. The last one is its scroll trigger. */
  roots: HTMLElement[];
  script: Script;
};

export type SectionState = "pending" | "queued" | "building" | "built";

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
  private readonly sections = new Map<string, Section & { state: SectionState }>();
  private readonly triggers = new Map<Element, string>();
  private queue: string[] = [];
  private current: string | null = null;
  private token: Token = { dead: false };
  private io: IntersectionObserver | null = null;
  private running = false;

  constructor(options: RunnerOptions) {
    this.options = options;
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
    setBoost(this.pace);
    this.observe();
  }

  /** Stops building. The section mid-build is finished at once; the rest wait. */
  stop(): void {
    this.running = false;
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
    this.token = { dead: false };
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
  get status(): { building: string | null; queued: number; done: boolean } {
    return {
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
    const T = this.token;
    try {
      await section.script(T);
    } catch (e) {
      if (e !== ABORT) console.error(e); // a broken script still leaves a built section
    }
    if (T !== this.token) return; // stopped meanwhile, and kill() has tidied up

    this.finish(key);
    this.current = null;
    this.release();
    this.changed();
    void this.pump();
  }

  private observe(): void {
    this.io ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = this.triggers.get(entry.target);
          if (key && entry.isIntersecting) this.enqueue(key);
        }
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
    }
    section.state = "built";
  }

  private reset(key: string): void {
    const section = this.sections.get(key);
    if (!section) return;
    for (const el of elements(section.roots)) {
      el.classList.remove("on", "draft");
      unlockSize(el);
    }
    section.state = "pending";
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

/** A section's roots and everything inside them marked with data-b. */
function elements(roots: HTMLElement[]): Element[] {
  return roots.flatMap((root) => [
    ...(root.hasAttribute("data-b") ? [root] : []),
    ...root.querySelectorAll("[data-b]"),
  ]);
}
