import type { MetadataRoute } from "next";

const BASE = "https://morpholens-app.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/explore", "/compare", "/experiment", "/about"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}
