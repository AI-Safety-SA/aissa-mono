import { withPayload } from '@payloadcms/next/withPayload'
import { buildRemoteImagePatterns } from './image-remote-patterns.mjs'

const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim()

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/platform-events'],
  images: {
    remotePatterns: buildRemoteImagePatterns(r2PublicUrl),
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
