const CLOUDFLARE_R2_REMOTE_PATTERN = {
  protocol: 'https',
  hostname: '**.r2.dev',
  pathname: '/**',
}

function normalizeRemotePattern(remotePattern) {
  return JSON.stringify(remotePattern)
}

/**
 * Build the remote patterns for Next.js image optimization.
 *
 * If `R2_PUBLIC_URL` is present, use its exact host/path pattern. Without it,
 * fall back to the broad Cloudflare R2 public bucket pattern for local/dev
 * compatibility.
 *
 * @param {string | undefined} r2PublicUrl
 * @returns {import('next/dist/shared/lib/image-config').RemotePattern[]}
 */
export function buildRemoteImagePatterns(r2PublicUrl) {
  if (!r2PublicUrl) {
    return [CLOUDFLARE_R2_REMOTE_PATTERN]
  }

  const url = new URL(r2PublicUrl.trim())
  const normalizedPathname = url.pathname.replace(/\/$/, '')

  const remotePatterns = [
    {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: `${normalizedPathname || ''}/**`,
    },
  ]

  return [...new Map(remotePatterns.map((pattern) => [normalizeRemotePattern(pattern), pattern])).values()]
}
