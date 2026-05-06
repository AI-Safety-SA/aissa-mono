import Link from "next/link";
import Image from "next/image";

export function AissaBrand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center text-foreground">
      <span className="flex h-12 items-center justify-center rounded-xl bg-[hsl(var(--brand-dark-surface))] md:h-18 md:rounded-2xl">
        <Image
          src="/header-logo.png"
          alt=""
          height={256}
          width={256}
          className="m-2 h-8 w-auto md:m-4 md:h-14"
          priority
        />
      </span>
    </Link>
  );
}
