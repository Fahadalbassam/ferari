import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Force project root so Turbopack doesn't pick the desktop bun.lockb
    root: __dirname,
  },
};

export default nextConfig;
