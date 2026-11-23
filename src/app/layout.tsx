import type { Metadata, Viewport } from "next";
import { Merriweather, Raleway, Space_Mono } from "next/font/google";
import { profile } from "@content/profile";
import { THEME_KEY } from "@/components/theme";
import { SWARM_READY } from "@/swarm/sections";
import { SwarmLayer } from "@/swarm/SwarmLayer";
import "@/styles/tokens.css";
import "@/styles/swarm.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-merriweather",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: profile.name,
    template: `%s · ${profile.name}`,
  },
  description: `${profile.hero.role.plain} ${profile.hero.role.strong}`,
};

// The body pads itself with the safe-area insets, so the page may draw under a notch.
export const viewport: Viewport = {
  viewportFit: "cover",
};

// Runs while the HTML is parsed, before first paint, so a visitor who chose
// light never sees a dark flash. Dark stays the default for everyone else.
const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

// Also before first paint: the js class turns on the build states in swarm.css, which
// hide what the swarm will build. Not with reduced motion, which shows the page built.
// If a script fails before the swarm takes over, or it hasn't within 4s, the class goes
// and the page shows in full.
const swarmScript = `(function(){var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("js");var t=setTimeout(show,4000);function show(){d.classList.remove("js");stop()}function stop(){clearTimeout(t);removeEventListener("error",show);removeEventListener("unhandledrejection",show);document.removeEventListener(${JSON.stringify(SWARM_READY)},stop)}addEventListener("error",show);addEventListener("unhandledrejection",show);document.addEventListener(${JSON.stringify(SWARM_READY)},stop)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${raleway.variable} ${merriweather.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: swarmScript }} />
      </head>
      <body>
        {children}
        <SwarmLayer />
      </body>
    </html>
  );
}
