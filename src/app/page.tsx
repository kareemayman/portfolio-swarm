import { profile } from "@content/profile";
import { Stats } from "@/components/Stats";
import { Contact } from "@/sections/Contact";
import { Experience } from "@/sections/Experience";
import { Hero } from "@/sections/Hero";
import { Nav } from "@/sections/Nav";
import { Now } from "@/sections/Now";
import { Outside } from "@/sections/Outside";
import { Stack } from "@/sections/Stack";
import { Work } from "@/sections/Work";
import ui from "@/styles/ui.module.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={ui.wrap}>
      <Nav />
      <main>
        <Hero />
        <section id="proof" aria-label="In numbers">
          <Stats
            tight
            items={profile.proof.map((p) => ({
              value: p.value,
              unit: p.unit,
              caption: (
                <>
                  <b>{p.caption.lead}</b>
                  {p.caption.rest}
                </>
              ),
            }))}
          />
        </section>
        <Experience />
        <Work />
        <Now />
        <Stack />
        <Outside />
        <Contact />
      </main>
      <footer className={styles.foot}>
        <span>
          {profile.name} · {profile.contact.where}
        </span>
        <span>Built by Kareem Ayman</span>
      </footer>
    </div>
  );
}
