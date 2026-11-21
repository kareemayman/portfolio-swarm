import type { ProjectInput } from "../schema";

export const meetusDashboard: ProjectInput = {
  slug: "meetus-dashboard",
  title: "Meetus dashboard",
  kind: "Internal tool · Web",
  context: "MeetusVR",
  when: "2025 – 2026",
  status: "shipped",
  confidential: true,
  layer: "fe",
  layers: ["fe"],
  role: "Frontend developer",
  stack: ["React", "Redux", "MUI", "JSS", "Axios"],
  line: "A Shopify-style theme builder, no code needed",
  summary:
    "The admin side of the platform, including a Shopify-style theme builder so staff can edit a live store without code.",
  problem:
    "Changing a store's layout or content needed a developer. Staff needed to see and edit the real store themselves.",
  built: [
    "A theme builder that loads the live storefront in an iframe and lets staff edit sections, titles, order and images",
    "Gift card and wallet pass pages, with geofencing so passes only work in the right places",
    "Customer touchpoints that record orders, visited pages and cart contents",
    "Multi-country support for tags and order data",
    "A full audit of the dashboard for quality and consistency",
  ],
  results: [
    ["0", "code needed to edit a live store"],
    ["Live", "store preview inside the editor"],
    ["Multi", "country tags and order data"],
  ],
  architecture: {
    nodes: [
      { id: "ed", label: "Theme editor", sub: "dashboard · React", x: 16, y: 50, layer: "fe" },
      { id: "frame", label: "Live storefront", sub: "inside an iframe", x: 50, y: 22, layer: "fe" },
      { id: "cfg", label: "Theme config", sub: "sections · order · images", x: 50, y: 78, layer: "be" },
      { id: "store", label: "Storefront", sub: "renders from config", x: 84, y: 50, layer: "fe" },
    ],
    edges: [
      ["ed", "frame"],
      ["ed", "cfg"],
      ["cfg", "store"],
    ],
  },
  media: {
    url: "dashboard · confidential",
    shots: [
      { label: "Theme builder" },
      { label: "Wallet pass pages" },
      { label: "Customer touchpoints" },
    ],
  },
  link: null,
};
