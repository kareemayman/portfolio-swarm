import Link from "next/link";
import type { CSSProperties } from "react";
import { featured, projects } from "@content/projects";
import type { Layer, Project } from "@content/schema";
import { ProjectArt } from "@/components/ProjectArt";
import ui from "@/styles/ui.module.css";
import styles from "./Work.module.css";

const LAYER_NAME: Record<Layer, string> = { fe: "Frontend", be: "Backend", ai: "AI" };

const layerColor = (layer: Layer) => ({ "--c": `var(--${layer})` }) as CSSProperties;

function Card({ project }: { project: Project }) {
  const { card, link } = project;
  if (!card) return null;
  return (
    <article className={styles.card} data-b="box">
      <div className={styles.thumb} data-b="fill">
        <ProjectArt project={project} />
      </div>
      <span className={ui.tag} style={layerColor(project.layer)} data-b="tag">
        {card.tag}
      </span>
      <h3 data-b="text">
        {/* The link's hit area is stretched over the whole card in CSS. */}
        <Link href={`/work/${project.slug}`} className={styles.cardLink}>
          {project.title}
        </Link>
      </h3>
      <p data-b="text">{card.text}</p>
      <div className={styles.chips}>
        {card.chips.map((chip) => (
          <span className={ui.chip} key={chip} data-b="chip">
            {chip}
          </span>
        ))}
      </div>
      <div className={styles.acts}>
        {link ? (
          <a href={link.href} target="_blank" rel="noopener noreferrer" data-b="text">
            {card.linkLabel ?? link.label} ↗
          </a>
        ) : (
          <span className={styles.muted} data-b="text">
            {project.status === "in-progress" ? "In progress" : "Confidential"}
          </span>
        )}
        <span className={styles.det} aria-hidden="true" data-b="text">
          Details →
        </span>
      </div>
    </article>
  );
}

function IndexRow({ project }: { project: Project }) {
  return (
    <li>
      <Link
        href={`/work/${project.slug}`}
        className={styles.row}
        style={layerColor(project.layer)}
        data-b="row"
      >
        <span className={styles.ctx}>{project.context}</span>
        <span className={styles.title}>
          {project.title}
          {project.status === "in-progress" && <em>IN PROGRESS</em>}
          {project.confidential && <em className={styles.quiet}>CONFIDENTIAL</em>}
        </span>
        <span className={styles.line}>{project.line}</span>
        <span className={styles.layer}>
          <i />
          {LAYER_NAME[project.layer]}
        </span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}

export function Work() {
  return (
    <section className={ui.sec} id="work">
      <h2 data-b="text">
        Selected work<small>{projects.length} projects</small>
      </h2>
      <div className={ui.secBody}>
        <div className={styles.cards}>
          {featured.map((p) => (
            <Card project={p} key={p.slug} />
          ))}
        </div>

        <div className={styles.index} id="index">
          <div className={styles.indexHead}>
            <h3 data-b="text">
              All work<small>click to open</small>
            </h3>
          </div>
          <ul className={styles.list}>
            {projects.map((p) => (
              <IndexRow project={p} key={p.slug} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
