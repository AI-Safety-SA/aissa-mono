import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">AISSA</span>
            <span className="text-muted-foreground">Track Record</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/programs" className="hover:text-foreground transition-colors">
              Programs
            </Link>
            <Link href="/events" className="hover:text-foreground transition-colors">
              Events
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © {currentYear} AI Safety South Africa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
