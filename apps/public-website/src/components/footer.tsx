import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { BookOpen, Calendar, GraduationCap, HandHeart } from "lucide-react";
import { AissaBrand } from "./aissa-brand";

const siteLinks = [
  { href: "/programs", label: "Programs", icon: GraduationCap },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/get-involved", label: "Get Involved", icon: HandHeart },
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
    href: "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    label: "Luma",
    iconSrc: "/images/social/luma.svg",
  },
  {
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    label: "LinkedIn",
    iconSrc: "/images/social/linkedin.svg",
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
        <div>
          <AissaBrand logoVariant="light" />
          <FooterProfileLinks />
        </div>
        <div className="grid gap-7 sm:grid-cols-2 sm:gap-10">
          <FooterLinkGroup label="Site">
            {siteLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
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
        </div>
      </div>
    </footer>
  );
}

function FooterProfileLinks() {
  return (
    <div className="mt-5 flex items-center gap-2">
      {profileLinks.map(({ href, label, iconSrc }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener"
          aria-label={label}
          className="grid size-9 place-items-center rounded-full border border-white/20 bg-white transition hover:border-white/60 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-white dark:hover:bg-white"
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
