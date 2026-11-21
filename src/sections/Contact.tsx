import { profile } from "@content/profile";
import { CopyEmail } from "@/components/CopyEmail";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";
import styles from "./Contact.module.css";

/* The console is markup only until milestone 5. Its controls are disabled and it
   says so, so the page never shows a made-up guard count or an input that ignores
   the visitor. */
function Console() {
  const { placeholder } = profile.contact;
  return (
    <div className={styles.console} id="console" data-b="box">
      <div className={styles.head}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span data-b="text">guest@kareem: ~/agent</span>
        <span className={styles.meta}>
          <span data-b="text">offline</span>
        </span>
      </div>
      <div className={styles.body} role="log" aria-live="polite">
        <p className={styles.line} data-b="text">
          <b>kareem.agent</b> is not connected yet.
        </p>
        <p className={styles.line} data-b="text">
          It will answer from my CV and project notes and cite its sources. Until then, the email
          below works.
        </p>
      </div>
      <form className={styles.input} autoComplete="off">
        <label htmlFor="agent-input">›</label>
        <input
          id="agent-input"
          name="q"
          spellCheck={false}
          placeholder={placeholder}
          aria-label="Ask the agent or type a command"
          disabled
        />
        <button className={cx(ui.btn, ui.sm, ui.solid)} type="submit" disabled data-b="text">
          Run
        </button>
      </form>
    </div>
  );
}

export function Contact() {
  const { contact } = profile;
  return (
    <section className={ui.sec} id="ask">
      <h2 data-b="text">
        Contact<small>{contact.where}</small>
      </h2>
      <div className={styles.wrap}>
        <p className={styles.heading} data-b="text">
          {contact.heading}
        </p>
        <p className={styles.intro} data-b="text">
          {contact.intro}
        </p>
        <Console />
        <div className={styles.suggestions}>
          {contact.suggestions.map((s) => (
            <button type="button" key={s} disabled data-b="chip">
              {s}
            </button>
          ))}
        </div>
        <div className={styles.contact}>
          <CopyEmail email={contact.email} />
          {contact.links.map((link) => (
            <a
              className={cx(ui.btn, ui.sm)}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              key={link.href}
              data-b="box"
            >
              <span data-b="text">{link.label} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
