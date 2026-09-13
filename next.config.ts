import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The search API reads the full UniMorph files fetched by `prebuild`.
  outputFileTracingIncludes: {
    "/api/search": ["./unimorph-data/*.tsv", "./unimorph-data/shas.txt"],
  },
};

export default nextConfig;
