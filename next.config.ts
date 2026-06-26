import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lean Docker image: outputs a minimal standalone server bundle.
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
