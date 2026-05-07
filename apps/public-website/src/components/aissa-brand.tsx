import Link from "next/link";
import Image from "next/image";

export function AissaBrand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center text-foreground">
      <span className="relative block h-10 w-[150px] md:h-14 md:w-[210px]">
        <Image
          src="/aissa_logo_black.png"
          alt="AI Safety South Africa"
          height={544}
          width={2045}
          className="h-full w-auto object-contain [html[data-theme=dark]_&]:hidden"
        />
        <Image
          src="/aissa_logo_light.png"
          alt="AI Safety South Africa"
          height={544}
          width={2045}
          className="hidden h-full w-auto object-contain [html[data-theme=dark]_&]:block"
        />
      </span>
    </Link>
  );
}
