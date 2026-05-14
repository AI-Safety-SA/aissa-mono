import type { CSSProperties } from "react";
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

const logoSlotSizeClasses: Record<PartnerLogo["renderSize"], string> = {
  small: "h-8 w-32 sm:w-36 md:h-10 md:w-40 lg:h-12 lg:w-44",
  medium: "h-10 w-40 sm:w-44 md:h-12 md:w-48 lg:h-14 lg:w-56",
  large: "h-14 w-48 sm:w-56 md:h-16 md:w-64 lg:h-18 lg:w-72",
};

function LogoStrip({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "partner-logo-strip flex shrink-0 items-center gap-5 sm:gap-6 md:gap-7 lg:gap-9",
        hidden && "partner-logo-strip-duplicate",
      )}
    >
      {partnerLogos.map((logo) => (
        <div
          className={cn(
            "partner-logo-item flex shrink-0 items-center justify-center",
            logoSlotSizeClasses[logo.renderSize],
          )}
          key={`${hidden ? "duplicate" : "primary"}-${logo.src}`}
        >
          <img
            src={logo.src}
            alt={hidden ? "" : logo.alt}
            loading="eager"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export function PartnerLogoBanner() {
  return (
    <section
      aria-label="AISSA partners"
      className="w-full overflow-hidden border-y border-[hsl(var(--partner-logo-divider))] bg-[hsl(var(--partner-logo-surface))] py-3"
    >
      <div className="mx-auto max-w-7xl md:max-w-none">
        <div
          aria-label="Partner logo list"
          className="partner-banner-wrapper relative w-full overflow-hidden contrast-[1.08]"
          role="group"
          tabIndex={0}
        >
          <div
            className="partner-banner-track flex items-center py-4 md:py-6"
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
