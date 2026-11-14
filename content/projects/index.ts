import { Project } from "../schema";
import { chatService } from "./chat-service";
import { meetusvr } from "./meetusvr";
import { merchantDashboard } from "./merchant-dashboard";
import { skillswap } from "./skillswap";
import { taskify } from "./taskify";
import { tseppas } from "./tseppas";
import { typeBeatBeast } from "./type-beat-beast";
import { vantage } from "./vantage";
import { yumazing } from "./yumazing";

/** Page order, as set in the handoff. The first three are the featured cards. */
export const projects: Project[] = [
  tseppas,
  typeBeatBeast,
  vantage,
  meetusvr,
  merchantDashboard,
  yumazing,
  skillswap,
  chatService,
  taskify,
].map((p) => Project.parse(p));

const slugs = new Set(projects.map((p) => p.slug));
if (slugs.size !== projects.length) throw new Error("Two projects share a slug");

export const featured = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The project `step` places away, wrapping at both ends. */
export function neighbor(slug: string, step: 1 | -1): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + step + projects.length) % projects.length];
}
