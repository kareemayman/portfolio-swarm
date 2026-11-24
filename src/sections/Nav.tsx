import { profile } from "@content/profile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";
import styles from "./Nav.module.css";

// The swarm builds the nav as part of the hero section (see Hero.swarm.ts). The head
// script may mark it data-built before hydration, hence suppressHydrationWarning.
export function Nav() {
  return (
    <nav
      className={styles.nav}
      aria-label="Main"
      data-swarm="hero"
      data-b="line"
      suppressHydrationWarning
    >
      <span className={styles.logo} data-b="text">
        {profile.logo}
      </span>
      <div className={styles.links}>
        <a href="#work" className={styles.hideSm} data-b="text">
          Work
        </a>
        <a href="#experience" className={styles.hideSm} data-b="text">
          Experience
        </a>
        <a href="#now" className={styles.hideSm} data-b="text">
          Now
        </a>
        <a href="#ask" className={cx(ui.btn, ui.sm)} data-b="box">
          <span data-b="text">
            Ask my agent <kbd>/</kbd>
          </span>
        </a>
        <ThemeToggle className={cx(ui.btn, ui.sm)} />
      </div>
    </nav>
  );
}
