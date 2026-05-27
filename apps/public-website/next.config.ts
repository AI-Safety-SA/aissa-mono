import type { NextConfig } from "next";
import { buildRemoteImagePatterns } from "./src/lib/image-remote-patterns";

const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildRemoteImagePatterns(r2PublicUrl),
    deviceSizes: [640, 1024, 1440, 1920],
    imageSizes: [32, 48, 64, 96, 128, 176, 256, 384],
    formats: ["image/webp"],
    qualities: [75],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
