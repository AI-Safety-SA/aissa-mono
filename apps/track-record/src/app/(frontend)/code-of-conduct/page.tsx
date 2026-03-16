import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Code of Conduct',
  description: 'AISSA Community Code of Conduct',
}

const CODE_OF_CONDUCT_URL =
  'https://aisafetysa.getoutline.com/s/aa885466-1262-41f1-8f3d-e3b02d701539'

export default function CodeOfConductPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col">
      <iframe
        src={CODE_OF_CONDUCT_URL}
        title="AISSA Code of Conduct"
        sandbox="allow-same-origin allow-scripts"
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 5rem)' }}
        loading="lazy"
      ></iframe>
    </main>
  )
}
