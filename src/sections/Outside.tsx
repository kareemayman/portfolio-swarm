import { profile } from "@content/profile";
import { BeatPlayer } from "@/components/BeatPlayer";
import ui from "@/styles/ui.module.css";
import styles from "./Outside.module.css";

export function Outside() {
  const { music, programming } = profile.outside;
  return (
    <section className={ui.sec} id="outside">
      <h2 data-b="text">
        Outside work<small>where the habits come from</small>
      </h2>
      <div className={styles.duo}>
        <div className={styles.card} data-b="box">
          <BeatPlayer>
            <div className={styles.big} data-b="text">
              {music.big}
              <small>{music.bigNote}</small>
            </div>
            <h3 data-b="text">{music.title}</h3>
            <p data-b="text">{music.text}</p>
          </BeatPlayer>
        </div>
        <div className={styles.card} data-b="box">
          <div className={styles.big} data-b="text">
            {programming.big}
            <small>{programming.bigNote}</small>
          </div>
          <h3 data-b="text">{programming.title}</h3>
          <p data-b="text">{programming.text}</p>
        </div>
      </div>
    </section>
  );
}
