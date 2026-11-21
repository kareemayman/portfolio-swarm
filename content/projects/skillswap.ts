import type { ProjectInput } from "../schema";

export const skillswap: ProjectInput = {
  slug: "skillswap",
  title: "SkillSwap",
  kind: "AI · Full stack",
  context: "ITI",
  when: "2025",
  status: "shipped",
  layer: "ai",
  layers: ["ai", "fe", "be"],
  role: "ITI graduation project",
  stack: ["React", "React Native", "Firebase", "Gemini API", "Tailwind"],
  line: "Skill trading with Gemini learning plans",
  summary:
    "Trade skills or book paid lessons. Gemini turns each skill into a step-by-step learning plan.",
  problem:
    "People who want to learn from each other need a way to match, schedule, and know what to learn next.",
  built: [
    "A web app in React and a mobile app in React Native",
    "Firebase for auth, data and chat",
    "Scheduling, reviews and paid lessons",
    "Gemini-generated learning milestones for each skill",
  ],
  results: [
    ["2", "apps: web and mobile"],
    ["1", "shared Firebase back end"],
    ["AI", "learning plan per skill"],
  ],
  architecture: {
    nodes: [
      { id: "web", label: "Web app", sub: "React", x: 14, y: 26, layer: "fe" },
      { id: "mob", label: "Mobile app", sub: "React Native", x: 14, y: 74, layer: "fe" },
      { id: "fb", label: "Firebase", sub: "auth · data · chat", x: 50, y: 50, layer: "be" },
      { id: "gem", label: "Gemini API", sub: "learning milestones", x: 84, y: 50, layer: "ai" },
    ],
    edges: [
      ["web", "fb"],
      ["mob", "fb"],
      ["fb", "gem"],
    ],
  },
  media: {
    url: "github.com/kareemayman/SkillSwap-Web",
    shots: [
      { label: "Skill profile" },
      { label: "Generated learning plan" },
      { label: "Lesson chat" },
    ],
  },
  link: { label: "Code on GitHub", href: "https://github.com/kareemayman/SkillSwap-Web" },
};
