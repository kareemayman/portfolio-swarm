import type { CSSProperties } from "react";
import { profile } from "@content/profile";
import ui from "@/styles/ui.module.css";
import styles from "./Stack.module.css";

export function Stack() {
  return (
    <section className={ui.sec} id="stack">
      <h2 data-b="text">
        Stack<small>by layer</small>
      </h2>
      <div className={styles.rows}>
        {profile.stack.map((row) => (
          <div
            className={styles.row}
            key={row.label}
            style={{ "--c": `var(--${row.layer})` } as CSSProperties}
          >
            <span className={styles.key} data-b="text">
              <i />
              {row.label}
            </span>
            <div className={styles.items}>
              {row.items.map((item) => (
                <span className={styles.chip} key={item} data-b="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
