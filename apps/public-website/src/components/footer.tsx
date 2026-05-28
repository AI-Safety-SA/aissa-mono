import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  HandHeart,
} from "lucide-react";
import { AissaBrand } from "./aissa-brand";
import {
  LumaIcon,
  XIcon,
  type SocialIcon as ProfileIcon,
} from "./social-icons";

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
    icon: { kind: "image", src: "/images/social/substack.svg" },
  },
  {
    href: "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    label: "Luma",
    icon: { kind: "inline", Icon: LumaIcon },
  },
  {
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    label: "LinkedIn",
    icon: { kind: "image", src: "/images/social/linkedin.svg" },
  },
  {
    href: "https://x.com/AI_Safety_SA",
    label: "X",
    icon: { kind: "inline", Icon: XIcon },
  },
] satisfies ProfileLink[];

type ProfileLink = {
  href: string;
  label: string;
  icon: ProfileIcon;
};

export function Footer() {
  return (
    <footer className="border-t border-white/15 bg-brand-navy text-primary-foreground">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(560px,1.2fr)] lg:items-start">
          <div className="max-w-2xl flex flex-col items-start gap-6">
            <AissaBrand logoVariant="light" />
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FooterLinkGroup label="Explore">
              {siteLinks.map(({ href, label, icon: Icon }) => (
                <FooterLink key={href} href={href}>
                  <Icon className="size-4 shrink-0 text-brand-sandstone" />
                  <span>{label}</span>
                </FooterLink>
              ))}
            </FooterLinkGroup>
            <FooterLinkGroup label="Information">
              {policyLinks.map(({ href, label }) => (
                <FooterLink key={href} href={href}>
                  <span>{label}</span>
                  {href.startsWith("http") ? (
                    <ExternalLink className="size-3.5 shrink-0 text-brand-sandstone" />
                  ) : null}
                </FooterLink>
              ))}
            </FooterLinkGroup>
            <FooterLinkGroup label="Socials">
              <FooterProfileLinks />
            </FooterLinkGroup>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs text-primary-foreground/72 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 AI Safety South Africa.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterProfileLinks() {
  return (
    <>
      {profileLinks.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex w-fit items-center gap-2 rounded-md py-1.5 text-sm text-primary-foreground/76 transition hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sandstone"
        >
          <span className="grid size-4 place-items-center">
            <FooterProfileIcon icon={icon} />
          </span>
          <span className="underline-offset-4 group-hover:underline">
            {label}
          </span>
        </Link>
      ))}
    </>
  );
}

function FooterProfileIcon({ icon }: { icon: ProfileIcon }) {
  if (icon.kind === "inline") {
    const Icon = icon.Icon;

    return (
      <Icon
        aria-hidden="true"
        className="size-4 text-current opacity-80 transition group-hover:opacity-100"
      />
    );
  }

  return (
    <Image
      src={icon.src}
      alt=""
      width={32}
      height={32}
      loading="eager"
      className="size-4 object-contain opacity-80 brightness-0 invert transition group-hover:opacity-100"
    />
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
      <h2 className="text-sm font-semibold text-primary-foreground">{label}</h2>
      <div className="mt-4 flex flex-col gap-2 text-sm">{children}</div>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex w-fit items-center gap-2 rounded-md py-1.5 text-primary-foreground/76 transition hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sandstone"
    >
      {children}
    </Link>
  );
}
