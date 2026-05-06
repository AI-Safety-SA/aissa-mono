import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getPublicWebsiteUrl } from '@/components/public-website-url'

export const metadata: Metadata = {
  title: 'Code of Conduct | AI Safety South Africa',
  description: 'AI Safety South Africa community code of conduct.',
}

export default function CodeOfConductPage() {
  redirect(getPublicWebsiteUrl('/code-of-conduct'))
}
