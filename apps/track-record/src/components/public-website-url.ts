const PUBLIC_WEBSITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL?.replace(/\/$/, '') ||
  'https://aissa-mono-public-website.vercel.app'

export function getPublicWebsiteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${PUBLIC_WEBSITE_URL}${normalizedPath}`
}
