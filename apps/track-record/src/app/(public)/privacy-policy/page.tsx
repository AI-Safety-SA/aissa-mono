import { redirect } from 'next/navigation'
import { getPublicWebsiteUrl } from '@/components/public-website-url'

export const metadata = {
  title: 'Privacy Policy | AI Safety South Africa',
  description: 'Privacy policy for AI Safety South Africa.',
}

export default function PrivacyPolicyPage() {
  redirect(getPublicWebsiteUrl('/privacy-policy'))
}
