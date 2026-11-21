import type { ProjectInput } from "../schema";

export const taskify: ProjectInput = {
  slug: "taskify",
  title: "Taskify",
  kind: "Full stack · Web",
  context: "Side project",
  // No year yet: handoff section 12 lists it as a fact to confirm.
  status: "shipped",
  layer: "be",
  layers: ["be", "fe"],
  role: "Solo",
  stack: ["React", "Redux", "Express", "JWT"],
  line: "Team boards on my own Express API",
  summary: "A task manager for teams, with its own Express API and token-based sign-in.",
  problem:
    "I wanted a project that covered the whole request, from a React board to my own API and auth.",
  built: ["React and Redux boards for teams", "A REST API in Express", "JWT authentication"],
  results: [
    ["REST", "API in Express"],
    ["JWT", "authentication"],
    ["Teams", "shared boards"],
  ],
  architecture: {
    nodes: [
      { id: "board", label: "Team boards", sub: "React · Redux", x: 16, y: 50, layer: "fe" },
      { id: "api", label: "REST API", sub: "Express", x: 48, y: 50, layer: "be" },
      { id: "auth", label: "Auth", sub: "JWT", x: 82, y: 24, layer: "be" },
      { id: "db", label: "Database", sub: "tasks · users", x: 82, y: 76, layer: "be" },
    ],
    edges: [
      ["board", "api"],
      ["api", "auth"],
      ["api", "db"],
    ],
  },
  media: {
    url: "github.com/kareemayman/Task-Manager",
    shots: [{ label: "Team board" }, { label: "Task detail" }, { label: "Sign in" }],
  },
  link: { label: "Code on GitHub", href: "https://github.com/kareemayman/Task-Manager" },
};
