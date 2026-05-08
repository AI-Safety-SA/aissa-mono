import Link from "next/link";
import Image from "next/image";

type AissaBrandProps = {
  href?: string;
  logoVariant?: "theme" | "light";
};

export function AissaBrand({
  href = "/",
  logoVariant = "theme",
}: AissaBrandProps) {
  const forceLight = logoVariant === "light";

  return (
    <Link href={href} className="flex shrink-0 items-center text-foreground">
      <span className="relative block h-10 w-[150px] md:h-14 md:w-[210px]">
        {forceLight ? null : (
          <Image
            src="/aissa_logo_black.png"
            alt="AI Safety South Africa"
            height={544}
            width={2045}
            className="h-full w-auto object-contain [html[data-theme=dark]_&]:hidden"
          />
        )}
        <Image
          src="/aissa_logo_light.png"
          alt="AI Safety South Africa"
          height={544}
          width={2045}
          className={
            forceLight
              ? "h-full w-auto object-contain"
              : "hidden h-full w-auto object-contain [html[data-theme=dark]_&]:block"
          }
        />
      </span>
    </Link>
  );
}
