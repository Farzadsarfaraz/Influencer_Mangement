import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is for the self-hosted Docker build (docker/Dockerfile) —
  // it changes Next's output layout in a way that breaks Vercel's own
  // file-tracing build step, so skip it when building on Vercel.
  output: process.env.VERCEL ? undefined : "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
