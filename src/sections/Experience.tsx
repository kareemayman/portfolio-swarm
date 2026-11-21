import { profile } from "@content/profile";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";
import styles from "./Experience.module.css";

export function Experience() {
  const { span, rows } = profile.experience;
  return (
    <section className={ui.sec} id="experience">
      <h2 data-b="text">
        Experience<small>{span}</small>
      </h2>
      <div className={styles.table} role="table" aria-label="Experience" data-b="box">
        <div className={cx(styles.tr, styles.th)} role="row">
          <span role="columnheader" data-b="text">
            When
          </span>
          <span role="columnheader" data-b="text">
            Role
          </span>
          <span role="columnheader" data-b="text">
            What I did
          </span>
        </div>
        {rows.map((row) => (
          <div className={styles.tr} role="row" key={row.when} data-p>
            <span className={styles.when} role="cell" data-b="text">
              {row.when}
            </span>
            <span className={styles.role} role="cell">
              <b data-b="text">{row.role}</b>
              <span data-b="text">{row.where}</span>
            </span>
            <span className={styles.what} role="cell" data-b="text">
              {row.what}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
