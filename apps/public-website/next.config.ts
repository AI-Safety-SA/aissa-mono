import type { NextConfig } from "next";
import { buildRemoteImagePatterns } from "./src/lib/image-remote-patterns";

const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildRemoteImagePatterns(r2PublicUrl),
  },
};

export default nextConfig;
