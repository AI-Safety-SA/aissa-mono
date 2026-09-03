import type { NextConfig } from "next";

// Set only while serving from the default project-pages subpath
// (https://ai-safety-sa.github.io/aissa-mono/). Remove once aisafetysa.com
// DNS points at GitHub Pages and the custom domain is verified in the
// repo's Pages settings, since the custom domain serves from "/".
// NEXT_PUBLIC_-prefixed so src/lib/base-path.ts can read the same value
// from client components.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
