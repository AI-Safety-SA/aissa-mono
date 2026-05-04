import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PersonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PersonPage(_props: PersonPageProps) {
  notFound()
}
