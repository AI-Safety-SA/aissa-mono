import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Community | AISSA Track Record',
  description: 'Meet the AI Safety South Africa community members.',
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  notFound()
}
