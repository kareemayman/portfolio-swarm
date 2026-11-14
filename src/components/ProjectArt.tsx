import type { ReactNode } from "react";
import type { Project } from "@content/schema";
import styles from "./ProjectArt.module.css";

/* Placeholder "screens" for each project, ported from the prototype's canvas art to
   static SVG so they render without JavaScript. Real recordings replace them in
   milestone 4, except for the confidential projects, which keep illustrative art.
   Media keeps its own colors in both themes, so the colors here are literal on purpose. */

const HEX = { fe: "#6ea8ff", be: "#ff1e56", ai: "#ffac41" } as const;
const INK = "#f3f1ee";
const W = 480;
const T = 1.2; // the moment the prototype freezes its animation at for a still frame

export type Shot = 0 | 1 | 2;

const n = (v: number) => Math.round(v * 100) / 100;

function Mono({
  x,
  y,
  size,
  fill = INK,
  weight = 700,
  children,
}: {
  x: number;
  y: number;
  size: number;
  fill?: string;
  weight?: number;
  children: ReactNode;
}) {
  return (
    <text x={n(x)} y={n(y)} fontSize={size} fontWeight={weight} fill={fill}>
      {children}
    </text>
  );
}

function R({
  x,
  y,
  w,
  h,
  r = 0,
  ...rest
}: { x: number; y: number; w: number; h: number; r?: number } & React.SVGProps<SVGRectElement>) {
  return <rect x={n(x)} y={n(y)} width={n(w)} height={n(h)} rx={r} {...rest} />;
}

/** Type Beat Beast: a waveform filling up as the upload progresses. */
function beat(H: number, v: Shot, col: string) {
  const count = 46;
  const bw = (W - 48) / count;
  const prog = v === 0 ? (T * 0.25) % 1 : v === 1 ? 0.62 : 1;
  const status = ["uploading", "rendering video", "scheduled 18:00"][v];
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = Math.abs(Math.sin(i * 0.55 + v) * Math.cos(i * 0.19)) * 0.8 + 0.12;
        const h = a * H * 0.45 * (1 + 0.08 * Math.sin(T * 6 + i));
        return (
          <R
            key={i}
            x={24 + i * bw}
            y={H * 0.42 - h / 2}
            w={bw - 3}
            h={h}
            r={2}
            fill={i / count < prog ? col : "#3a2329"}
          />
        );
      })}
      <R x={24} y={H * 0.74} w={W - 48} h={10} r={5} fill="#1a1a1d" />
      <R x={24} y={H * 0.74} w={(W - 48) * prog} h={10} r={5} fill={col} />
      <Mono x={24} y={H * 0.9} size={13}>
        {status} {Math.round(prog * 100)}%
      </Mono>
    </>
  );
}

const STORE_PALETTE: Record<string, string[]> = {
  tseppas: ["#6ea8ff", "#3f6fd1", "#9cc3ff", "#2a4f9e", "#6ea8ff", "#c9ddff"],
  yumazing: ["#ffac41", "#ff6b3d", "#ffd27a", "#e8893a", "#ffac41", "#ffe2a8"],
};

/** Tseppas and Yumazing: a product grid, then a map-priced checkout, then a QR pass. */
function store(slug: string, H: number, v: Shot, col: string) {
  const cols = 3;
  const cw = (W - 32 - (cols - 1) * 12) / cols;
  const ch = (H - 34 - 40) / 2;
  const palette = STORE_PALETTE[slug] ?? STORE_PALETTE.tseppas;
  return (
    <>
      <R x={0} y={0} w={W} h={34} fill="#16181d" />
      <Mono x={16} y={22} size={13} fill={col}>
        {slug}
      </Mono>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 16 + (i % cols) * (cw + 12);
        const y = 48 + Math.floor(i / cols) * (ch + 10);
        const pop = (Math.sin(T * 2 + i) + 1) / 2;
        const alpha = 0.55 + 0.45 * (v === 1 && i === 1 ? 1 : pop * 0.4 + 0.6);
        return (
          <g key={i}>
            <R x={x} y={y} w={cw} h={ch} r={8} fill="#151a24" />
            <circle
              cx={n(x + cw / 2)}
              cy={n(y + ch * 0.44)}
              r={n(ch * 0.24)}
              fill={palette[i]}
              opacity={n(alpha)}
            />
            <R x={x + 10} y={y + ch - 18} w={cw * 0.5} h={6} r={3} fill="#2a2f3a" />
          </g>
        );
      })}
      {v === 1 && (
        <>
          <R x={0} y={0} w={W} h={H} fill="#000" opacity={0.7} />
          <R x={W * 0.55} y={40} w={W * 0.4} h={H - 60} r={10} fill="#141821" />
          <path
            d={`M${n(W * 0.6)} ${n(H * 0.35)} C ${n(W * 0.7)} ${n(H * 0.2)}, ${n(W * 0.8)} ${n(H * 0.6)}, ${n(W * 0.9)} ${n(H * 0.4)}`}
            fill="none"
            stroke={col}
            strokeWidth={2}
          />
          <circle cx={n(W * 0.9)} cy={n(H * 0.4)} r={5} fill={col} />
          <Mono x={W * 0.6} y={H * 0.8} size={11}>
            shipping 18 SAR
          </Mono>
        </>
      )}
      {v === 2 && (
        <>
          <R x={0} y={0} w={W} h={H} fill="#000" opacity={0.75} />
          <R x={W / 2 - 50} y={H / 2 - 50} w={100} h={100} r={8} fill={INK} />
          {Array.from({ length: 64 }, (_, i) =>
            (i * 7 + Math.floor(T * 2)) % 3 ? (
              <R
                key={i}
                x={W / 2 - 42 + (i % 8) * 10.5}
                y={H / 2 - 42 + Math.floor(i / 8) * 10.5}
                w={9}
                h={9}
                fill="#000"
              />
            ) : null,
          )}
        </>
      )}
      <circle cx={W - 22} cy={17} r={9} fill={col} />
    </>
  );
}

/** Merchant dashboard: a sidebar and the theme editor's stacked sections. */
function dashboard(H: number, v: Shot, col: string) {
  const fx = W * 0.3;
  const fw = W * 0.66;
  const order = v === 0 ? [0, 1, 2] : [1, 0, 2];
  const ph = (H - 60) / 3;
  const caption = ["editing: hero section", "reordered sections", "touchpoints · 128 events"][v];
  return (
    <>
      <R x={0} y={0} w={W * 0.26} h={H} fill="#121318" />
      {Array.from({ length: 6 }, (_, i) => (
        <R
          key={i}
          x={12}
          y={20 + i * 30}
          w={W * 0.26 - 24}
          h={18}
          r={4}
          fill={i === Math.floor(T) % 6 ? col : "#23252c"}
        />
      ))}
      <R x={fx} y={16} w={fw} h={H - 32} r={8} fill="none" stroke="#2a2d36" />
      {order.map((k, i) => {
        const y = 28 + i * (ph + 6);
        return (
          <g key={k}>
            <R
              x={fx + 12}
              y={y}
              w={fw - 24}
              h={ph}
              r={6}
              fill={["#1d2a44", "#1a2233", "#151a24"][k]}
            />
            {k === 0 && (
              <R
                x={fx + 12}
                y={y}
                w={fw - 24}
                h={ph}
                r={6}
                fill="none"
                stroke={col}
                strokeDasharray="5 4"
              />
            )}
          </g>
        );
      })}
      <Mono x={fx + 14} y={H - 8} size={11} weight={400}>
        {caption}
      </Mono>
    </>
  );
}

/** Vantage: water lines under a slowly turning wheel. */
function tours(H: number, v: Shot, col: string) {
  const r = 46;
  const caption = ["vantage · summer tours", "Sinai · 6 seats left", "book 2 seats"][v];
  return (
    <>
      {[0, 1, 2].map((i) => {
        const pts: string[] = [];
        for (let x = 0; x <= W; x += 8) {
          const y = H * (0.55 + i * 0.12) + Math.sin(x / 60 + T * (1 + i * 0.3) + v) * 14;
          pts.push(`${x},${n(y)}`);
        }
        return (
          <polyline
            key={i}
            points={pts.join(" ")}
            fill="none"
            stroke="#6ea8ff"
            strokeOpacity={0.25 + i * 0.25}
            strokeWidth={2}
          />
        );
      })}
      <g
        transform={`translate(${W * 0.5} ${n(H * 0.36)}) rotate(${n(((T * 0.6 + v) * 180) / Math.PI)})`}
        fill="none"
        stroke={col}
        strokeWidth={2}
      >
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          return <line key={i} x1={0} y1={0} x2={n(Math.cos(a) * r)} y2={n(Math.sin(a) * r * 0.6)} />;
        })}
        <ellipse cx={0} cy={0} rx={r} ry={n(r * 0.6)} />
      </g>
      <Mono x={18} y={26} size={12}>
        {caption}
      </Mono>
    </>
  );
}

/** SkillSwap: four learning milestones on a dashed path. */
function plan(H: number, v: Shot, col: string) {
  const pts = [
    [60, 0.72],
    [190, 0.42],
    [300, 0.6],
    [420, 0.3],
  ].map(([x, y]) => [x, y * H]);
  const done = v === 0 ? Math.floor(T) % 5 : v + 1;
  const caption = ["plan generated by Gemini", "milestone 2 of 4", "lesson booked · Thu"][v];
  return (
    <>
      <polyline
        points={pts.map(([x, y]) => `${x},${n(y)}`).join(" ")}
        fill="none"
        stroke={col}
        strokeWidth={3}
        strokeDasharray="8 7"
        strokeDashoffset={-T * 20}
      />
      {["basics", "practice", "project", "teach"].map((label, i) => {
        const [x, y] = pts[i];
        return (
          <g key={label}>
            <circle
              cx={x}
              cy={n(y)}
              r={12}
              fill={i < done ? col : "#0e0e10"}
              stroke={col}
              strokeWidth={2.5}
            />
            <Mono x={x - 24} y={y + 32} size={11} weight={400}>
              {i + 1} {label}
            </Mono>
          </g>
        );
      })}
      <Mono x={18} y={28} size={12} fill={col}>
        {caption}
      </Mono>
    </>
  );
}

/** MeetusVR.com: the homepage, the phone layout, then cards rising in on scroll. */
function company(H: number, v: Shot, col: string) {
  const top = (
    <>
      <R x={0} y={0} w={W} h={30} fill="#121318" />
      <Mono x={16} y={20} size={12} fill={col}>
        meetusvr
      </Mono>
    </>
  );
  if (v === 1) {
    const pw = W * 0.28;
    const px = W / 2 - pw / 2;
    return (
      <>
        {top}
        <R x={px} y={40} w={pw} h={H - 50} r={14} fill="#15161c" />
        <R x={px + 12} y={64} w={pw * 0.7} h={10} r={3} fill={INK} />
        <R x={px + 12} y={80} w={pw * 0.5} h={10} r={3} fill={INK} />
        {[0, 1, 2].map((i) => (
          <R key={i} x={px + 12} y={104 + i * 44} w={pw - 24} h={36} r={6} fill="#1f2330" />
        ))}
      </>
    );
  }
  const cw = (W - 48) / 3;
  return (
    <>
      {top}
      <R x={24} y={54} w={W * 0.52} h={18} r={4} fill={INK} />
      <R x={24} y={80} w={W * 0.38} h={18} r={4} fill={INK} />
      <R x={24} y={112} w={92} h={22} r={11} fill={col} />
      {[0, 1, 2].map((i) => {
        const p = v === 2 ? Math.min(1, Math.max(0, ((T * 0.7) % 1.6) - i * 0.25)) : 1;
        return (
          <R
            key={i}
            x={24 + i * cw}
            y={H * 0.6 + (1 - p) * 34}
            w={cw - 10}
            h={H * 0.3}
            r={8}
            fill="#1a1d26"
            opacity={n(p)}
          />
        );
      })}
    </>
  );
}

/** Chat service: message bubbles and a typing indicator. */
function chat(H: number, v: Shot, col: string) {
  const msgs = 5 + v;
  const dots = Math.floor(T * 3) % 4;
  return (
    <>
      {Array.from({ length: msgs }, (_, i) => {
        const me = i % 2 === 1;
        const w = 120 + ((i * 53) % 140);
        const y = H - 30 - (msgs - i) * 30;
        return (
          <R
            key={i}
            x={me ? W - w - 16 : 16}
            y={y}
            w={w}
            h={22}
            r={11}
            fill={me ? col : "#1d1f26"}
            opacity={me ? 0.85 : 1}
          />
        );
      })}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={28 + i * 10} cy={H - 14} r={3} fill={INK} opacity={i < dots ? 1 : 0.25} />
      ))}
    </>
  );
}

/** Taskify: three board columns with one card mid-drag. */
function board(H: number, v: Shot, col: string) {
  const colW = (W - 32) / 3;
  return (
    <>
      {[0, 1, 2].map((c) => {
        const x = 16 + c * colW;
        return (
          <g key={c}>
            <R x={x} y={16} w={colW - 10} h={H - 32} r={8} fill="#15161b" />
            {Array.from({ length: 3 + ((c + v) % 2) }, (_, i) => {
              const moving = c === 0 && i === 0 && v === 0;
              return (
                <R
                  key={i}
                  x={x + 8 + (moving ? (T * 40) % 60 : 0)}
                  y={40 + i * 34}
                  w={colW - 26}
                  h={26}
                  r={5}
                  fill={moving ? col : "#24262e"}
                />
              );
            })}
          </g>
        );
      })}
    </>
  );
}

function scene(slug: string, H: number, v: Shot, col: string) {
  switch (slug) {
    case "type-beat-beast":
      return beat(H, v, col);
    case "tseppas":
    case "yumazing":
      return store(slug, H, v, col);
    case "merchant-dashboard":
      return dashboard(H, v, col);
    case "vantage":
      return tours(H, v, col);
    case "skillswap":
      return plan(H, v, col);
    case "meetusvr":
      return company(H, v, col);
    case "chat-service":
      return chat(H, v, col);
    default:
      return board(H, v, col);
  }
}

export function ProjectArt({
  project,
  shot = 0,
  ratio = "16/10",
  label,
}: {
  project: Pick<Project, "slug" | "layer">;
  shot?: Shot;
  /** 16/10 for cards, 16/9 for the project page's stage and thumbnails. */
  ratio?: "16/10" | "16/9";
  /** Accessible name. Leave out where the art sits next to a title and is decorative. */
  label?: string;
}) {
  const H = ratio === "16/9" ? 270 : 300;
  return (
    <svg
      className={styles.art}
      viewBox={`0 0 ${W} ${H}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width={W} height={H} fill="#0e0e10" />
      {scene(project.slug, H, shot, HEX[project.layer])}
    </svg>
  );
}
