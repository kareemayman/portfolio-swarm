import type { CSSProperties } from "react";
import { profile } from "@content/profile";
import { getContributions, type Level } from "@/lib/github";
import ui from "@/styles/ui.module.css";
import styles from "./Now.module.css";

// How much of --ink each activity level mixes into the empty square's color.
const MIX: Record<Level, string> = { 0: "0%", 1: "22%", 2: "45%", 3: "70%", 4: "95%" };

const mix = (level: Level) => ({ "--l": MIX[level] }) as CSSProperties;

async function GitHubPanel() {
  const calendar = await getContributions(profile.github);
  if (!calendar) return null;

  const summary = `${calendar.total.toLocaleString("en-US")} contributions in the last 52 weeks`;
  return (
    <div className={styles.gh} data-b="box">
      <div className={styles.ghHead}>
        <a
          href={`https://github.com/${profile.github}`}
          target="_blank"
          rel="noopener noreferrer"
          data-b="text"
        >
          github.com/{profile.github}
        </a>
        <span className={styles.dim} data-b="text">
          last 52 weeks · {calendar.total.toLocaleString("en-US")} contributions
        </span>
      </div>
      <div className={styles.heatWrap}>
        <div className={styles.heat} role="img" aria-label={summary}>
          {calendar.weeks.map((week) => (
            <div className={styles.col} key={week[0].date} data-b="col">
              {week.map((day) => (
                <i key={day.date} style={mix(day.level)} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.ghFoot}>
        <span data-b="text">Public activity, refreshed from GitHub once a day.</span>
        <span className={styles.legend} aria-hidden="true">
          <span>less</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <i key={level} style={mix(level)} />
          ))}
          <span>more</span>
        </span>
      </div>
    </div>
  );
}

export function Now() {
  const { updated, items } = profile.now;
  return (
    <section className={ui.sec} id="now">
      <h2 data-b="text">
        Right now<small>updated {updated}</small>
      </h2>
      <div className={ui.secBody}>
        <ul className={styles.now}>
          {items.map((item) => (
            <li
              key={item.key}
              style={{ "--c": `var(--${item.layer})` } as CSSProperties}
              data-b="box"
            >
              <span className={styles.key} data-b="text">
                <i />
                {item.key}
              </span>
              <p data-b="text">
                <b>{item.text.lead}</b>
                {item.text.rest}
              </p>
            </li>
          ))}
        </ul>
        {/* No Suspense boundary on purpose. The calendar is cached, so it prerenders
            inline with the page. Behind a boundary it ships as a late chunk that a
            script reveals, and the panel disappears when JavaScript is off. */}
        <GitHubPanel />
      </div>
    </section>
  );
}
