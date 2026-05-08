import { withPayload } from '@payloadcms/next/withPayload'
import { buildRemoteImagePatterns } from './image-remote-patterns.mjs'

const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim()
const publicWebsiteUrl =
  process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL?.trim().replace(/\/$/, '') ||
  'https://aissa-mono-public-website.vercel.app'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: buildRemoteImagePatterns(r2PublicUrl),
  },
  async redirects() {
    return [
      {
        source: '/privacy-policy',
        destination: `${publicWebsiteUrl}/privacy-policy`,
        permanent: false,
      },
      {
        source: '/code-of-conduct',
        destination: `${publicWebsiteUrl}/code-of-conduct`,
        permanent: false,
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
