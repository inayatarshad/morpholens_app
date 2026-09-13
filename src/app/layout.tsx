import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader, Noto_Nastaliq_Urdu } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-jetbrains", display: "swap" });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], weight: ["400", "600"], variable: "--font-nastaliq", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "MorphoLens — Explore how words change across languages",
    template: "%s · MorphoLens",
  },
  description:
    "An interactive research prototype for low-resource morphology, lexical variation and unseen-word generalisation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${jetbrains.variable} ${nastaliq.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
