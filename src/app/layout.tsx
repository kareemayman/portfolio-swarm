import type { Metadata, Viewport } from "next";
import { Merriweather, Raleway, Space_Mono } from "next/font/google";
import { profile } from "@content/profile";
import { THEME_KEY } from "@/components/theme";
import "@/styles/tokens.css";

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
      </head>
      <body>{children}</body>
    </html>
  );
}
