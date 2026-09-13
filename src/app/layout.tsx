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

const description =
  "An interactive research workspace for low-resource morphology and unseen-lemma generalisation, built on UniMorph data for Turkish, Urdu, Evenki, Chukchi and Romanian.";

export const metadata: Metadata = {
  metadataBase: new URL("https://morpholens-app.vercel.app"),
  title: {
    default: "MorphoLens: Explore how words change across languages",
    template: "%s · MorphoLens",
  },
  description,
  keywords: ["morphology", "UniMorph", "low-resource NLP", "morphological inflection", "lemma-disjoint evaluation", "Evenki", "Chukchi", "Urdu", "Turkish", "Romanian"],
  openGraph: {
    title: "MorphoLens",
    description,
    url: "/",
    siteName: "MorphoLens",
    images: [{ url: "/logo.png", width: 189, height: 158, alt: "MorphoLens" }],
    type: "website",
  },
  twitter: { card: "summary", title: "MorphoLens", description, images: ["/logo.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${jetbrains.variable} ${nastaliq.variable}`}>
      <body>
        <noscript>
          <style>{".reveal,.kinetic .kw{opacity:1!important;transform:none!important;filter:none!important}"}</style>
        </noscript>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
