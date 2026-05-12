import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { AissaBrand } from "./aissa-brand";

const siteLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/research", label: "Research" },
  { href: "/get-involved", label: "Get Involved" },
];

const policyLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/code-of-conduct", label: "Code of Conduct" },
  { href: "https://tally.so/r/2EEV5A", label: "Feedback" },
];

const profileLinks = [
  {
    href: "https://aisafetysouthafrica.substack.com/",
    label: "Substack",
    iconSrc: "/images/social/substack.svg",
  },
  {
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    label: "LinkedIn",
    iconSrc: "/images/social/linkedin.png",
  },
  {
    href: "https://x.com/AI_Safety_SA",
    label: "X",
    iconSrc: "/images/social/x.svg",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-brand-dark-surface text-white [&_a]:text-white">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <AissaBrand logoVariant="light" />
        <div className="grid gap-7 sm:grid-cols-3 sm:gap-10">
          <FooterLinkGroup label="Site">
            {siteLinks.map(({ href, label }) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </FooterLinkGroup>
          <FooterLinkGroup label="Policies">
            {policyLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener" : undefined}
              >
                {label}
              </Link>
            ))}
          </FooterLinkGroup>
          <div>
            <div className="mt-3 flex items-center gap-2">
              {profileLinks.map(({ href, label, iconSrc }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-white/35 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Image
                    src={iconSrc}
                    alt=""
                    width={24}
                    height={24}
                    loading="eager"
                    className="size-5 object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <nav aria-label={label}>
      <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
        {children}
      </div>
    </nav>
  );
}
