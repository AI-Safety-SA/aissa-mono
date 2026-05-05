import type { RemotePattern } from "next/dist/shared/lib/image-config";

const CLOUDFLARE_R2_REMOTE_PATTERN = {
  protocol: "https",
  hostname: "**.r2.dev",
  pathname: "/**",
} satisfies RemotePattern;

const LOCAL_REMOTE_PATTERNS = [
  {
    protocol: "http",
    hostname: "localhost",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
  },
] satisfies RemotePattern[];

function normalizeRemotePattern(remotePattern: RemotePattern) {
  return JSON.stringify(remotePattern);
}

export function buildRemoteImagePatterns(r2PublicUrl?: string) {
  const remotePatterns: RemotePattern[] = [
    ...LOCAL_REMOTE_PATTERNS,
    CLOUDFLARE_R2_REMOTE_PATTERN,
  ];

  if (!r2PublicUrl) {
    return remotePatterns;
  }

  const url = new URL(r2PublicUrl.trim());
  const normalizedPathname = url.pathname.replace(/\/$/, "");

  remotePatterns.push({
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: `${normalizedPathname || ""}/**`,
  });

  return [
    ...new Map(
      remotePatterns.map((pattern) => [normalizeRemotePattern(pattern), pattern]),
    ).values(),
  ];
}
