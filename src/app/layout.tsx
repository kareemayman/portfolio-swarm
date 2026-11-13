import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kareem Ayman",
  description: "Software engineer. Full stack, building with AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
