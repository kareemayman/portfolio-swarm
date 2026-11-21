import type { ProjectInput } from "../schema";

export const tseppas: ProjectInput = {
  slug: "tseppas",
  title: "Tseppas",
  kind: "E-commerce · Web",
  context: "MeetusVR",
  when: "2025 – 2026",
  status: "shipped",
  live: true,
  layer: "fe",
  layers: ["fe"],
  featured: true,
  role: "Frontend developer, then frontend lead",
  stack: ["React", "Next.js 14", "SCSS", "Google Maps", "i18n"],
  line: "A live store, 70% faster, with a new checkout",
  summary:
    "An e-commerce store I made 70% faster, gave a new checkout and localized for Saudi Arabia.",
  problem:
    "The store was slow, and it needed a better checkout and a localized catalog to grow into the Saudi market.",
  built: [
    "Image optimization, code splitting and a smaller bundle, tracked on FCP, LCP and CLS",
    "Checkout with tax and shipping priced by location on Google Maps, later moved to open-source maps",
    "Gift cards with checkout payment and points redemption",
    "Wallet passes with dynamic QR codes and geofencing",
    "Saudi localization of tags, currency, catalog and imagery",
    "Started the move from Create React App to Next.js 14",
  ],
  results: [
    ["70%", "faster, tracked on FCP, LCP and CLS"],
    ["SA", "market localized end to end"],
    ["QR", "wallet passes with geofencing"],
  ],
  architecture: {
    nodes: [
      { id: "web", label: "Storefront", sub: "React → Next.js 14", x: 15, y: 50, layer: "fe" },
      { id: "api", label: "Store API", sub: "orders · catalog", x: 43, y: 50, layer: "be" },
      { id: "maps", label: "Maps", sub: "shipping by location", x: 76, y: 18, layer: "ink" },
      { id: "gift", label: "Gift cards", sub: "payment · points", x: 80, y: 50, layer: "be" },
      { id: "wallet", label: "Wallet passes", sub: "QR · geofence", x: 76, y: 82, layer: "be" },
    ],
    edges: [
      ["web", "api"],
      ["api", "maps"],
      ["api", "gift"],
      ["api", "wallet"],
    ],
  },
  media: {
    url: "tseppas.com",
    shots: [
      { label: "Storefront" },
      { label: "Checkout with map shipping" },
      { label: "Wallet pass" },
    ],
  },
  link: { label: "Visit tseppas.com", href: "https://tseppas.com/" },
  card: {
    tag: "E-commerce · Live",
    text: "A production store I made 70% faster, then rebuilt its checkout with tax and map-based shipping.",
    chips: ["React", "Next.js", "Google Maps"],
    linkLabel: "tseppas.com",
  },
};
