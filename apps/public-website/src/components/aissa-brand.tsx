import Link from "next/link";
import Image from "next/image";
import { withBasePath } from "@/lib/base-path";

type AissaBrandProps = {
  href?: string;
  logoVariant?: "dark" | "light";
  priority?: boolean;
};

export function AissaBrand({
  href = "/",
  logoVariant = "dark",
  priority = false,
}: AissaBrandProps) {
  const logoSrc = withBasePath(
    logoVariant === "light" ? "/aissa_logo_light.png" : "/aissa_logo_black.png",
  );

  return (
    <Link href={href} className="flex shrink-0 items-center text-foreground">
      <span className="relative block h-10 w-[150px] md:h-14 md:w-[210px]">
        <Image
          src={logoSrc}
          alt="AI Safety South Africa"
          height={544}
          priority={priority}
          width={2045}
          className="h-full w-auto object-contain"
        />
      </span>
    </Link>
  );
}
