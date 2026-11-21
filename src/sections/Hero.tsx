import { profile } from "@content/profile";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";
import styles from "./Hero.module.css";

export function Hero() {
  const { hero, name } = profile;
  return (
    <header className={styles.hero}>
      <span className={styles.pill} data-b="box">
        <i />
        <span data-b="text">{hero.status}</span>
      </span>
      <h1 className={styles.name} data-b="text">
        {name}
      </h1>
      <p className={styles.role} data-b="text">
        {hero.role.plain} <b>{hero.role.strong}</b>
      </p>
      <p className={styles.lede} data-b="text">
        {hero.intro}
      </p>
      <div className={styles.cta}>
        <a className={cx(ui.btn, ui.solid)} href="#work" data-b="box">
          <span data-b="text">See my work</span>
        </a>
        <a className={ui.btn} href="#ask" data-b="box">
          <span data-b="text">Ask my agent</span>
        </a>
      </div>
    </header>
  );
}
