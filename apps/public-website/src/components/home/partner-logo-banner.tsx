import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type PartnerLogo = {
  alt: string;
  renderSize: "small" | "medium" | "large";
  src: string;
};

const partnerLogos: PartnerLogo[] = [
  {
    alt: "CoopAI Logo",
    renderSize: "small",
    src: "/images/partner-logos/CoopAI_Primary_Black.png",
  },
  {
    alt: "UCT AI Initiative Logo",
    renderSize: "medium",
    src: "/images/partner-logos/uct-ai-initiative.png",
  },
  {
    alt: "Open Philanthropy Logo",
    renderSize: "medium",
    src: "/images/partner-logos/openphil_logo.svg",
  },
  {
    alt: "UCT Partner Logo",
    renderSize: "large",
    src: "/images/partner-logos/uct-partner.png",
  },
  {
    alt: "Ashgro Logo",
    renderSize: "small",
    src: "/images/partner-logos/ashgro-logo.png",
  },
  {
    alt: "Apart Logo",
    renderSize: "medium",
    src: "/images/partner-logos/apart_logo.png",
  },
  {
    alt: "Lambda Logo",
    renderSize: "medium",
    src: "/images/partner-logos/lambda_logo_stacked_black.svg",
  },
  {
    alt: "Effective Altruism South Africa Logo",
    renderSize: "large",
    src: "/images/partner-logos/EA-SA-horizontal-logo.png",
  },
  {
    alt: "Ilina Program Logo",
    renderSize: "medium",
    src: "/images/partner-logos/ilina-program.png",
  },
  {
    alt: "Condor Initiative Logo",
    renderSize: "medium",
    src: "/images/partner-logos/condor-initiative.png",
  },
  {
    alt: "Wits Logo",
    renderSize: "large",
    src: "/images/partner-logos/wits-logo.png",
  },
  {
    alt: "Deep Learning Indaba X Logo",
    renderSize: "large",
    src: "/images/partner-logos/indabax-logo.png",
  },
];

const logoHeightClasses: Record<PartnerLogo["renderSize"], string> = {
  small: "h-8 md:h-10 lg:h-12",
  medium: "h-10 md:h-12 lg:h-14",
  large: "h-14 md:h-16 lg:h-18",
};

function LogoStrip({ hidden = false }: { hidden?: boolean }) {
  return (
    <>
      {partnerLogos.map((logo) => (
        <div
          aria-hidden={hidden}
          className="partner-logo-item shrink-0"
          key={`${hidden ? "duplicate" : "primary"}-${logo.src}`}
        >
          <Image
            src={logo.src}
            alt={hidden ? "" : logo.alt}
            width={256}
            height={96}
            className={cn(
              "w-auto max-w-56 object-contain lg:max-w-64",
              logoHeightClasses[logo.renderSize],
            )}
          />
        </div>
      ))}
    </>
  );
}

export function PartnerLogoBanner() {
  return (
    <section
      aria-label="AISSA partners"
      className="w-full overflow-hidden border-y border-brand-sandstone/60 bg-[#f8f0dc] py-3"
    >
      <div className="mx-auto max-w-7xl md:max-w-none">
        <div className="partner-banner-wrapper relative w-full overflow-hidden contrast-[1.1]">
          <div
            className="partner-banner-track flex items-center gap-5 py-4 sm:gap-6 md:gap-7 md:py-6 lg:gap-9"
            style={{ "--marquee-duration": "42s" } as CSSProperties}
          >
            <LogoStrip />
            <LogoStrip hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
