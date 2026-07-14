import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/playerkit",
  images: { unoptimized: true },
};

export default withMDX(nextConfig);
