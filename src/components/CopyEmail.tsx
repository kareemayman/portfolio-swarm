"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";
import styles from "./CopyEmail.module.css";

const IDLE = "Copy email";

/** The email address and a button that copies it. Without JavaScript the address is still selectable. */
export function CopyEmail({ email }: { email: string }) {
  const [label, setLabel] = useState(IDLE);
  const address = useRef<HTMLElement>(null);
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(reset.current), []);

  function flash(text: string) {
    setLabel(text);
    clearTimeout(reset.current);
    reset.current = setTimeout(() => setLabel(IDLE), 2000);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      flash("Copied");
    } catch {
      // No clipboard access: select the address so one keystroke finishes the job.
      const node = address.current;
      const selection = getSelection();
      if (node && selection) {
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      flash("Selected, press Ctrl+C");
    }
  }

  return (
    <>
      <code className={styles.email} ref={address} data-b="text">
        {email}
      </code>
      <button type="button" className={cx(ui.btn, ui.sm)} onClick={copy} data-b="box">
        <span aria-live="polite" data-b="text">
          {label}
        </span>
      </button>
    </>
  );
}
