import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";

export type Stat = { value: string; unit?: string; caption: ReactNode };

/** A row of three big numbers with mono captions. `tight` is the proof row's phone spacing. */
export function Stats({
  items,
  tight = false,
  id,
}: {
  items: Stat[];
  tight?: boolean;
  id?: string;
}) {
  return (
    <div className={cx(ui.stats, tight && ui.tight)} id={id}>
      {items.map((s, i) => (
        <div className={ui.stat} key={i}>
          <div className={ui.statN} data-b="count">
            <span data-v>{s.value}</span>
            {s.unit && <small>{s.unit}</small>}
          </div>
          <p data-b="text">{s.caption}</p>
        </div>
      ))}
    </div>
  );
}
