import type { CSSProperties } from "react";
import type { Project } from "@content/schema";
import ui from "@/styles/ui.module.css";
import styles from "./Architecture.module.css";

/* The diagram is laid out on the server so it is complete without JavaScript.
   Nodes sit at a percentage of the canvas, so an edge's ends depend on the canvas
   width, which the server doesn't know. Two things make the geometry solvable in
   CSS alone: the canvas height is fixed, and each node gets an explicit width
   (computed below from its text, since the labels are monospace). Each edge is then
   its own SVG stretched between the two nodes with calc(). */

const HEIGHT = 340;
const GAP = 3; // space between an arrowhead and the node it points at
const ARROW = 9.8; // 7 marker units at a 1.4px stroke, as in the prototype

const LABEL_SIZE = 12.5;
const SUB_SIZE = 11;
const NODE_CHROME = 26; // 12px padding each side + 1px border each side
const SLACK = 6; // room for sub-pixel rounding, so a line that should fit never wraps

type Node = Project["architecture"]["nodes"][number];

// Space Mono advances 0.612em per character. Symbols it doesn't have, such as "→",
// come from a fallback font and are about a full em wide.
function textWidth(text: string, size: number): number {
  let em = 0;
  for (const char of text) em += char.codePointAt(0)! > 0x2000 ? 1.1 : 0.612;
  return em * size;
}

function nodeWidth(node: Node): number {
  const text = Math.max(textWidth(node.label, LABEL_SIZE), textWidth(node.sub, SUB_SIZE));
  return Math.min(190, Math.max(128, Math.ceil(text) + NODE_CHROME + SLACK));
}

const layerColor = (layer: Node["layer"]) => (layer === "ink" ? "var(--ink-3)" : `var(--${layer})`);

export function Architecture({ project }: { project: Project }) {
  const { nodes, edges } = project.architecture;
  const byId = new Map(nodes.map((node) => [node.id, { ...node, width: nodeWidth(node) }]));

  return (
    <div
      className={styles.wrap}
      role="group"
      aria-label={`${project.title} architecture diagram`}
      tabIndex={0}
    >
      <div className={styles.arch}>
        {edges.map(([from, to]) => {
          const a = byId.get(from)!;
          const z = byId.get(to)!;
          const y1 = (a.y / 100) * HEIGHT;
          const y2 = (z.y / 100) * HEIGHT;
          return (
            <div key={`${from}-${to}`} aria-hidden="true">
              <svg
                className={styles.edge}
                viewBox={`0 0 100 ${HEIGHT}`}
                preserveAspectRatio="none"
                style={{
                  left: `calc(${a.x}% + ${a.width / 2}px)`,
                  width: `calc(${z.x - a.x}% - ${a.width / 2 + z.width / 2 + GAP}px)`,
                }}
              >
                <path
                  d={`M0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`}
                  vectorEffect="non-scaling-stroke"
                  data-b="edge"
                  data-a={from}
                  data-z={to}
                />
              </svg>
              {/* Every edge arrives horizontally, so the arrowhead always points right. */}
              <svg
                className={styles.arrow}
                viewBox="0 0 10 10"
                style={{
                  left: `calc(${z.x}% - ${z.width / 2 + GAP + ARROW * 0.9}px)`,
                  top: y2 - ARROW / 2,
                }}
              >
                <path d="M0 0 L10 5 L0 10 z" />
              </svg>
            </div>
          );
        })}
        {[...byId.values()].map((node) => (
          <div
            className={styles.node}
            key={node.id}
            style={
              {
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: node.width,
                "--c": layerColor(node.layer),
              } as CSSProperties
            }
            data-b="box"
            data-n={node.id}
          >
            <b data-b="text">{node.label}</b>
            <span data-b="text">{node.sub}</span>
          </div>
        ))}
      </div>
      <ul className={ui.srOnly}>
        {edges.map(([from, to]) => (
          <li key={`${from}-${to}`}>
            {byId.get(from)!.label} connects to {byId.get(to)!.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
