import type { RemotePattern } from "next/dist/shared/lib/image-config";

const CLOUDFLARE_R2_REMOTE_PATTERN = {
  protocol: "https",
  hostname: "**.r2.dev",
  pathname: "/**",
} satisfies RemotePattern;

function normalizeRemotePattern(remotePattern: RemotePattern) {
  return JSON.stringify(remotePattern);
}

export function buildRemoteImagePatterns(r2PublicUrl?: string) {
  if (!r2PublicUrl) {
    return [CLOUDFLARE_R2_REMOTE_PATTERN];
  }

  const url = new URL(r2PublicUrl.trim());
  const normalizedPathname = url.pathname.replace(/\/$/, "");

  const remotePatterns: RemotePattern[] = [
    {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: `${normalizedPathname || ""}/**`,
    },
  ];

  return [
    ...new Map(
      remotePatterns.map((pattern) => [normalizeRemotePattern(pattern), pattern]),
    ).values(),
  ];
}
