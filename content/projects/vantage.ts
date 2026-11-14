import type { ProjectInput } from "../schema";

export const vantage: ProjectInput = {
  slug: "vantage",
  title: "Vantage",
  kind: "Web · 3D",
  context: "Side project",
  when: "2026",
  status: "in-progress",
  layer: "fe",
  layers: ["fe"],
  featured: true,
  role: "Design and build with Claude Code",
  stack: ["three.js", "Claude Code"],
  line: "Small-group summer tours, with 3D scenes",
  summary: "A playful booking site for small-group summer tours, with 3D scenes built in three.js.",
  problem:
    "Tour sites all look the same. I wanted booking a trip to feel light and fun, with a bit of 3D.",
  built: [
    "Tour listings and a booking flow for small groups",
    "3D scenes in three.js",
    "Built with Claude Code from a written plan",
  ],
  results: [
    ["3D", "scenes in three.js"],
    ["Small", "group tours only"],
    ["WIP", "in progress"],
  ],
  architecture: {
    nodes: [
      { id: "ui", label: "Booking UI", sub: "tours · dates · groups", x: 18, y: 50, layer: "fe" },
      { id: "three", label: "3D scenes", sub: "three.js", x: 54, y: 22, layer: "fe" },
      { id: "data", label: "Tour data", sub: "listings", x: 54, y: 78, layer: "be" },
      { id: "book", label: "Booking", sub: "small groups", x: 86, y: 50, layer: "be" },
    ],
    edges: [
      ["ui", "three"],
      ["ui", "data"],
      ["data", "book"],
    ],
  },
  media: {
    url: "vantage · in progress",
    shots: [{ label: "Landing scene" }, { label: "Tour page" }, { label: "Booking" }],
  },
  link: null,
  card: {
    tag: "3D · Web",
    text: "A playful booking site for small-group summer tours, with 3D scenes built in three.js.",
    chips: ["three.js", "Claude Code"],
  },
};
