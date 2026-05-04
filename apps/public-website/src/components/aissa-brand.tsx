import Link from "next/link";

export function AissaBrand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 text-foreground">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        AI
      </span>
      <span className="leading-tight">
        <span className="block font-semibold">AI Safety South Africa</span>
        <span className="block text-xs text-muted-foreground">
          Track record
        </span>
      </span>
    </Link>
  );
}
