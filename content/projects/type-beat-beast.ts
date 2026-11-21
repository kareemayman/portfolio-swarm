import type { ProjectInput } from "../schema";

export const typeBeatBeast: ProjectInput = {
  slug: "type-beat-beast",
  title: "Type Beat Beast",
  kind: "Open source · Desktop",
  context: "Side project",
  when: "2026",
  status: "shipped",
  layer: "be",
  layers: ["be", "fe"],
  featured: true,
  role: "Solo: design and build",
  stack: ["Electron", "Node.js", "YouTube Data API", "BeatStars"],
  line: "Renders, packages and uploads beats in one click",
  summary:
    "A free desktop app that turns a finished beat into a YouTube video and a BeatStars listing in one click.",
  problem:
    "I upload a beat every day. Each one meant rendering files in FL Studio, making a video, writing the title and uploading to two sites by hand.",
  built: [
    "A queue that takes the MP3, WAV and stems rendered from FL Studio",
    "A still-image video made from the beat and its cover art",
    "YouTube upload with title, BPM and store link, scheduled through the official API",
    "BeatStars upload with the stems packed alongside",
    "Released free and open source",
  ],
  results: [
    ["1", "click from render to upload"],
    ["2", "platforms in one pass"],
    ["~1k", "beats on the channel it serves"],
  ],
  architecture: {
    nodes: [
      { id: "fl", label: "FL Studio", sub: "MP3 · WAV · stems", x: 12, y: 50, layer: "ink" },
      { id: "app", label: "Type Beat Beast", sub: "Electron · Node", x: 38, y: 50, layer: "be" },
      { id: "video", label: "Video render", sub: "beat + cover art", x: 64, y: 22, layer: "fe" },
      { id: "yt", label: "YouTube Data API", sub: "upload · schedule", x: 88, y: 22, layer: "ink" },
      { id: "bs", label: "BeatStars", sub: "listing + stems", x: 88, y: 78, layer: "ink" },
    ],
    edges: [
      ["fl", "app"],
      ["app", "video"],
      ["video", "yt"],
      ["app", "bs"],
    ],
  },
  media: {
    url: "github.com/kareemayman/type-beat-beast",
    shots: [
      { label: "Upload queue" },
      { label: "Video render" },
      { label: "Scheduled on YouTube" },
    ],
  },
  link: { label: "Code on GitHub", href: "https://github.com/kareemayman/type-beat-beast" },
  card: {
    tag: "Open source · Desktop",
    text: "An Electron app that renders, packages and uploads music to YouTube and BeatStars in one click.",
    chips: ["Electron", "Node.js", "YouTube API"],
  },
};
