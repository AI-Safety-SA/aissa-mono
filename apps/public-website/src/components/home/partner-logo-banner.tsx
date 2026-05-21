"use client";

import { Pause, Play } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type PartnerLogo = {
  alt: string;
  height: number;
  renderSize: "small" | "medium" | "large";
  src: string;
  width: number;
};

const partnerLogos: PartnerLogo[] = [
  {
    alt: "CoopAI Logo",
    height: 184,
    renderSize: "small",
    src: "/images/partner-logos/CoopAI_Primary_Black.png",
    width: 1502,
  },
  {
    alt: "UCT AI Initiative Logo",
    height: 1135,
    renderSize: "medium",
    src: "/images/partner-logos/uct-ai-initiative.png",
    width: 1702,
  },
  {
    alt: "Open Philanthropy Logo",
    height: 60,
    renderSize: "medium",
    src: "/images/partner-logos/openphil_logo.svg",
    width: 192,
  },
  {
    alt: "Ashgro Logo",
    height: 311,
    renderSize: "small",
    src: "/images/partner-logos/ashgro-logo.png",
    width: 1500,
  },
  {
    alt: "Apart Logo",
    height: 170,
    renderSize: "medium",
    src: "/images/partner-logos/apart_logo.png",
    width: 538,
  },
  {
    alt: "Lambda Logo",
    height: 100,
    renderSize: "medium",
    src: "/images/partner-logos/lambda_logo_horizontal_black.svg",
    width: 463,
  },
  {
    alt: "Effective Altruism South Africa Logo",
    height: 175,
    renderSize: "large",
    src: "/images/partner-logos/EA-SA-horizontal-logo.png",
    width: 478,
  },
  {
    alt: "Ilina Program Logo",
    height: 1128,
    renderSize: "medium",
    src: "/images/partner-logos/ilina-program.png",
    width: 2160,
  },
  {
    alt: "Condor Initiative Logo",
    height: 64,
    renderSize: "medium",
    src: "/images/partner-logos/condor-initiative.png",
    width: 150,
  },
  {
    alt: "Wits Logo",
    height: 400,
    renderSize: "large",
    src: "/images/partner-logos/wits-logo.png",
    width: 373,
  },
  {
    alt: "Deep Learning Indaba X Logo",
    height: 298,
    renderSize: "large",
    src: "/images/partner-logos/indabax-logo.png",
    width: 1787,
  },
];

const logoSizeClasses: Record<PartnerLogo["renderSize"], string> = {
  small: "partner-logo-item--small",
  medium: "partner-logo-item--medium",
  large: "partner-logo-item--large",
};

function LogoStrip({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="partner-logo-strip flex shrink-0 items-center"
    >
      {partnerLogos.map((logo) => (
        <div
          className={cn(
            "partner-logo-item flex shrink-0 items-center justify-center leading-none",
            logoSizeClasses[logo.renderSize],
          )}
          key={`${hidden ? "duplicate" : "primary"}-${logo.src}`}
          style={
            {
              "--partner-logo-aspect": logo.width / logo.height,
            } as CSSProperties
          }
        >
          <img
            src={logo.src}
            alt={hidden ? "" : logo.alt}
            width={logo.width}
            height={logo.height}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}

function LogoGrid() {
  return (
    <div
      aria-label="Partner logo grid"
      className="partner-logo-grid hidden grid-cols-2 items-center gap-x-6 gap-y-7 px-5 py-5 sm:grid-cols-3 md:grid-cols-4"
      role="group"
    >
      {partnerLogos.map((logo) => (
        <div
          className={cn(
            "partner-logo-item flex items-center justify-center justify-self-center leading-none",
            logoSizeClasses[logo.renderSize],
          )}
          key={`grid-${logo.src}`}
          style={
            {
              "--partner-logo-aspect": logo.width / logo.height,
            } as CSSProperties
          }
        >
          <img
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export function PartnerLogoBanner() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      aria-label="AISSA partners"
      className="partner-logo-banner w-full overflow-hidden border-y border-[hsl(var(--partner-logo-divider))] bg-[hsl(var(--partner-logo-surface))] py-3"
      data-paused={isPaused}
    >
      <div className="mx-auto max-w-7xl md:max-w-none">
        <div
          aria-label="Partner logo list"
          className="partner-banner-wrapper partner-banner-marquee group relative w-full overflow-hidden contrast-[1.08]"
          role="group"
        >
          <button
            type="button"
            aria-label={
              isPaused
                ? "Resume partner logo animation"
                : "Pause partner logo animation"
            }
            aria-pressed={isPaused}
            className="partner-logo-control absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(var(--partner-logo-divider))] bg-[hsl(var(--partner-logo-surface)/0.92)] text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-background focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--partner-logo-surface))] group-hover:opacity-100"
            onClick={() => setIsPaused((paused) => !paused)}
          >
            {isPaused ? (
              <Play aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Pause aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
          <div className="partner-banner-track flex items-center py-4 md:py-6">
            <LogoStrip />
            <LogoStrip hidden />
          </div>
        </div>
        <LogoGrid />
      </div>
    </section>
  );
}
