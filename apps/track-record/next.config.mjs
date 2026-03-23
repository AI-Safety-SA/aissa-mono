import { withPayload } from '@payloadcms/next/withPayload'

const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim()
let r2RemotePattern

if (r2PublicUrl) {
  const url = new URL(r2PublicUrl)
  const normalizedPathname = url.pathname.replace(/\/$/, '')

  r2RemotePattern = {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: url.port,
    pathname: `${normalizedPathname || ''}/**`,
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: r2RemotePattern
    ? {
        remotePatterns: [r2RemotePattern],
      }
    : undefined,
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
