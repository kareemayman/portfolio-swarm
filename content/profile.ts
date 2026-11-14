import { Profile, type ProfileInput } from "./schema";

const data: ProfileInput = {
  name: "Kareem Ayman",
  logo: "kareem ayman",
  github: "kareemayman",
  hero: {
    status: "Open to work · Cairo, UTC+2",
    role: { plain: "Software engineer.", strong: "Full stack, building with AI." },
    intro:
      "I build web products end to end, from the interface to the API and the data behind it. About two years shipping React and Next.js in production, now building with Node, MongoDB and LLM agents.",
  },
  proof: [
    {
      value: "70",
      unit: "%",
      caption: { lead: "faster Tseppas", rest: ", mostly from image and bundle work" },
    },
    { value: "150", unit: "%", caption: { lead: "faster homepage", rest: " on Yumazing" } },
    {
      value: "561",
      unit: "cards",
      caption: { lead: "tickets on my name", rest: " at MeetusVR, the most on the team" },
    },
  ],
  experience: {
    span: "2019 to now",
    rows: [
      {
        when: "2025 – 2026",
        role: "Frontend developer → lead",
        where: "MeetusVR",
        what: "Made the Tseppas store 70% faster, built its checkout, gift cards and Saudi localization, and started its move to Next.js 14. Built a no-code theme builder for the merchant dashboard.",
      },
      {
        when: "Mar – Aug 2025",
        role: "Frontend and mobile intern",
        where: "ITI",
        what: "React, Next.js, React Native and TypeScript through product work. Built SkillSwap, a web and mobile app with Gemini-generated learning plans.",
      },
      {
        when: "2019 – 2023",
        role: "BSc Computer Science",
        where: "MTI, Cairo",
        what: "Graduated with an A on the graduation project.",
      },
    ],
  },
  now: {
    updated: "Nov 2026",
    items: [
      {
        key: "Learning",
        layer: "ai",
        text: {
          lead: "AI engineering:",
          rest: " retrieval, tool use and checking what LLMs answer.",
        },
      },
      {
        key: "Building",
        layer: "be",
        text: {
          lead: "The agent on this site.",
          rest: " It answers from my CV and projects and cites its sources.",
        },
      },
      {
        key: "Shipping",
        layer: "fe",
        text: { lead: "Vantage,", rest: " a tour-booking site with three.js scenes." },
      },
    ],
  },
  stack: [
    {
      label: "Frontend",
      layer: "fe",
      items: ["React", "Next.js", "TypeScript", "React Native", "Tailwind", "Redux"],
    },
    {
      label: "Backend",
      layer: "be",
      items: ["Node.js", "Express", "MongoDB", "Firebase", "REST · JWT", "WebSockets"],
    },
    {
      label: "AI",
      layer: "ai",
      items: ["LLM APIs", "Tool use", "Retrieval", "Claude Code", "Codex"],
    },
  ],
  outside: {
    music: {
      big: "770k+",
      bigNote: "views on my beats on YouTube",
      title: "I make hip-hop beats",
      text: "About 1,000 beats on my channel, one upload a day. Type Beat Beast started as a way to automate that routine.",
    },
    programming: {
      big: "Top 20",
      bigNote: "IOI 2016 qualifiers, Egypt",
      title: "Competitive programming",
      text: "Top 100 in the Egyptian Olympiad in Informatics in 2015, 160+ Codeforces problems and an algorithms camp at AUC. It's where I learned to think about cost before writing code.",
    },
  },
  contact: {
    where: "Cairo, UTC+2",
    heading: "Ask my agent anything.",
    intro:
      "It answers from my CV and project notes and shows its work. Or skip it and email me.",
    email: "kareem.mohamed.ayman@gmail.com",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/kareem-mohamed-ayman/" },
      { label: "GitHub", href: "https://github.com/kareemayman" },
    ],
    suggestions: [
      "What did he build at MeetusVR?",
      "Can he do backend?",
      "What's his AI experience?",
      "ls",
    ],
    placeholder: "what did he build at meetusvr?",
  },
};

export const profile = Profile.parse(data);
