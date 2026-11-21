import type { ProjectInput } from "../schema";

export const meetusvr: ProjectInput = {
  slug: "meetusvr",
  title: "MeetusVR.com",
  kind: "Company site · Web",
  context: "MeetusVR",
  when: "2025 – 2026",
  status: "shipped",
  live: true,
  layer: "fe",
  layers: ["fe"],
  role: "Frontend developer",
  stack: ["React", "Responsive CSS", "Scroll animations"],
  line: "The company's own site: redesigned, mobile-first",
  summary:
    "The company's own website. I redesigned the UI, rebuilt the layout for mobile and added scroll-based animations.",
  problem: "The company site needed a fresh look and a layout that worked properly on phones.",
  built: [
    "A UI redesign of the company site",
    "A responsive layout that works from phone to desktop",
    "Scroll-based animations as sections come into view",
  ],
  results: [
    ["New", "UI across the site"],
    ["Mobile", "layout on every page"],
    ["Live", "at meetusvr.com"],
  ],
  architecture: {
    nodes: [
      { id: "pages", label: "Pages", sub: "React", x: 18, y: 50, layer: "fe" },
      { id: "layout", label: "Layout system", sub: "phone → desktop", x: 52, y: 24, layer: "fe" },
      { id: "anim", label: "Scroll animations", sub: "reveal on enter", x: 52, y: 76, layer: "fe" },
      { id: "site", label: "meetusvr.com", sub: "production", x: 86, y: 50, layer: "ink" },
    ],
    edges: [
      ["pages", "layout"],
      ["pages", "anim"],
      ["layout", "site"],
      ["anim", "site"],
    ],
  },
  media: {
    url: "meetusvr.com",
    shots: [{ label: "Homepage" }, { label: "Mobile layout" }, { label: "Scroll animation" }],
  },
  link: { label: "Visit meetusvr.com", href: "https://meetusvr.com/" },
};
