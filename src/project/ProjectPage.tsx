import Link from "next/link";
import type { CSSProperties } from "react";
import { neighbor, projects } from "@content/projects";
import type { Project } from "@content/schema";
import { ProjectArt, type Shot } from "@/components/ProjectArt";
import { Stats } from "@/components/Stats";
import { cx } from "@/lib/cx";
import ui from "@/styles/ui.module.css";
import { Architecture } from "./Architecture";
import { MediaStage } from "./MediaStage";
import styles from "./ProjectPage.module.css";

const two = (n: number) => String(n).padStart(2, "0");

/**
 * The full project page. `/work/[slug]` renders it for direct visits; milestone 4
 * shows the same component in an overlay over the home page. `data-r` marks the
 * blocks the project-page runner will build one by one.
 */
export function ProjectPage({ project }: { project: Project }) {
  const position = projects.findIndex((p) => p.slug === project.slug) + 1;
  const prev = neighbor(project.slug, -1);
  const next = neighbor(project.slug, 1);
  const color = { "--c": `var(--${project.layer})` } as CSSProperties;
  const flags =
    (project.status === "in-progress" ? " · in progress" : "") +
    (project.confidential ? " · confidential" : "");

  const shots = project.media.shots.map((shot, i) => ({
    label: shot.label,
    view: (
      <ProjectArt
        project={project}
        shot={i as Shot}
        ratio="16/9"
        label={`${project.title}: ${shot.label} (illustration)`}
      />
    ),
    thumb: <ProjectArt project={project} shot={i as Shot} ratio="16/9" />,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <Link className={cx(ui.btn, ui.sm)} href="/#work">
          ← All work
        </Link>
        <div className={styles.pager}>
          <span className={styles.position}>
            {two(position)} / {two(projects.length)}
          </span>
          <Link
            className={cx(ui.btn, ui.sm)}
            href={`/work/${prev.slug}`}
            aria-label={`Previous project: ${prev.title}`}
          >
            ←
          </Link>
          <Link
            className={cx(ui.btn, ui.sm)}
            href={`/work/${next.slug}`}
            aria-label={`Next project: ${next.title}`}
          >
            →
          </Link>
        </div>
      </div>

      <header className={styles.head} data-r="head">
        <div className={styles.headTags}>
          <span className={ui.tag} style={color} data-b="tag">
            {project.kind + flags}
          </span>
          {project.live && (
            <span className={styles.live} data-b="text">
              <i />
              Live in production
            </span>
          )}
        </div>
        <h1 className={styles.title} data-b="text">
          {project.title}
        </h1>
        <p className={styles.summary} data-b="text">
          {project.summary}
        </p>
        <dl className={styles.meta}>
          <div>
            <dt>Role</dt>
            <dd data-b="text">{project.role}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd data-b="text">{project.context}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd data-b="text">{project.when ?? "Side project"}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd data-b="text">{project.stack.join(" · ")}</dd>
          </div>
        </dl>
        {project.link && (
          <a
            className={cx(ui.btn, ui.sm)}
            href={project.link.href}
            target="_blank"
            rel="noopener noreferrer"
            data-b="box"
          >
            <span data-b="text">{project.link.label} ↗</span>
          </a>
        )}
      </header>

      <section data-r="media" aria-label="Screens">
        <MediaStage url={project.media.url} shots={shots} />
        <p className={styles.mediaNote} data-b="text">
          {project.confidential
            ? "Confidential, so this art is illustrative with no client screens."
            : "Illustration for now. A screen recording will play here."}
        </p>
      </section>

      <section className={styles.block} data-r="story">
        <h2 data-b="text">
          The problem<small>why it existed</small>
        </h2>
        <p data-b="text">{project.problem}</p>
      </section>

      <section className={styles.block} data-r="built">
        <h2 data-b="text">
          What I built<small>{project.built.length} pieces</small>
        </h2>
        <ul style={color}>
          {project.built.map((item) => (
            <li key={item} data-b="text">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} data-r="arch">
        <h2 data-b="text">
          How it fits<small>architecture</small>
        </h2>
        <Architecture project={project} />
      </section>

      <section className={styles.block} data-r="results">
        <h2 data-b="text">
          Results<small>what changed</small>
        </h2>
        <div className={styles.results}>
          <Stats items={project.results.map(([value, caption]) => ({ value, caption }))} />
        </div>
      </section>

      <div className={styles.next} data-r="next">
        <Link href={`/work/${next.slug}`} className={styles.nextLink}>
          <small data-b="text">Next project</small>
          <span data-b="text">{next.title} →</span>
        </Link>
        <Link className={cx(ui.btn, ui.sm)} href="/#work">
          Back to all work
        </Link>
      </div>
    </div>
  );
}
