import type { ProjectInput } from "../schema";

export const yumazing: ProjectInput = {
  slug: "yumazing",
  title: "Yumazing",
  kind: "Food delivery · Web",
  context: "MeetusVR",
  when: "2025 – 2026",
  status: "shipped",
  live: true,
  layer: "fe",
  layers: ["fe"],
  role: "Frontend developer",
  stack: ["React", "Framer Motion"],
  line: "A homepage about 150% faster, plus guest checkout",
  summary:
    "A food delivery site. I redesigned the UI, made the homepage about 150% faster and added guest checkout.",
  problem: "The homepage was slow and ordering required an account.",
  built: [
    "A UI redesign with Framer Motion polish",
    "A homepage about 150% faster",
    "Guest checkout",
    "Promo codes",
  ],
  results: [
    ["150%", "faster homepage"],
    ["Guest", "checkout added"],
    ["Promo", "codes added"],
  ],
  architecture: {
    nodes: [
      { id: "home", label: "Homepage", sub: "React", x: 18, y: 50, layer: "fe" },
      { id: "cart", label: "Cart", sub: "promo codes", x: 50, y: 50, layer: "fe" },
      { id: "co", label: "Checkout", sub: "guest or signed in", x: 82, y: 50, layer: "be" },
    ],
    edges: [
      ["home", "cart"],
      ["cart", "co"],
    ],
  },
  media: {
    url: "yumazing.io",
    shots: [{ label: "Homepage" }, { label: "Menu" }, { label: "Guest checkout" }],
  },
  link: { label: "Visit yumazing.io", href: "https://www.yumazing.io" },
};
