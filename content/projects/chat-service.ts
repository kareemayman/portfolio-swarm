import type { ProjectInput } from "../schema";

export const chatService: ProjectInput = {
  slug: "chat-service",
  title: "Chat service",
  kind: "Real-time · Web",
  context: "MeetusVR",
  when: "2025 – 2026",
  status: "shipped",
  confidential: true,
  layer: "be",
  layers: ["be", "fe"],
  role: "Frontend developer",
  stack: ["React", "WebSocket"],
  line: "Rebuilt the UI, fixed the socket layer",
  summary:
    "A real-time chat that dropped messages. I rebuilt its interface and fixed its socket layer.",
  problem:
    "Messages didn't reliably show up in real time, and the interface was hard to work with.",
  built: [
    "Rebuilt the chat UI from scratch",
    "Traced the missing messages to wrong topic subscriptions",
    "Fixed the WebSocket layer to subscribe to the right topics",
  ],
  results: [
    ["New", "UI, built from scratch"],
    ["Fixed", "real-time delivery"],
    ["WS", "topic subscriptions corrected"],
  ],
  architecture: {
    nodes: [
      { id: "ui", label: "Chat UI", sub: "React", x: 18, y: 50, layer: "fe" },
      { id: "ws", label: "WebSocket", sub: "topic subscriptions", x: 50, y: 50, layer: "be" },
      { id: "svc", label: "Chat service", sub: "rooms · messages", x: 82, y: 50, layer: "be" },
    ],
    edges: [
      ["ui", "ws"],
      ["ws", "svc"],
    ],
  },
  media: {
    url: "chat · confidential",
    shots: [{ label: "Conversation view" }, { label: "Room list" }, { label: "Live typing" }],
  },
  link: null,
};
