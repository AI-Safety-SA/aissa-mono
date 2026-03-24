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
 * Cloudflare R2 public buckets are served from `*.r2.dev`, so we always
 * include that wildcard. If `R2_PUBLIC_URL` is present, we also add the
 * exact host/path pattern for custom public bucket URLs.
 *
 * @param {string | undefined} r2PublicUrl
 * @returns {import('next/dist/shared/lib/image-config').RemotePattern[]}
 */
export function buildRemoteImagePatterns(r2PublicUrl) {
  const remotePatterns = [CLOUDFLARE_R2_REMOTE_PATTERN]

  if (!r2PublicUrl) {
    return remotePatterns
  }

  const url = new URL(r2PublicUrl.trim())
  const normalizedPathname = url.pathname.replace(/\/$/, '')

  remotePatterns.push({
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: `${normalizedPathname || ''}/**`,
  })

  return [...new Map(remotePatterns.map((pattern) => [normalizeRemotePattern(pattern), pattern])).values()]
}
