import Link from "next/link";
import { AissaBrand } from "./aissa-brand";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-brand-dark-surface text-white [&_a]:text-white">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <AissaBrand logoVariant="light" />
        <nav className="flex flex-wrap gap-4 text-sm text-white/70">
          <Link href="/programs">Programs</Link>
          <Link href="/events">Events</Link>
          <Link href="/research">Research</Link>
          <Link href="/get-involved">Get Involved</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/code-of-conduct">Code of Conduct</Link>
        </nav>
      </div>
    </footer>
  );
}
