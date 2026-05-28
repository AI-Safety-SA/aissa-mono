"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  HandHeart,
  Home,
  Menu,
  X,
} from "lucide-react";
import { AissaBrand } from "./aissa-brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/programs", label: "Programs", icon: GraduationCap },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/get-involved", label: "Get Involved", icon: HandHeart },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-brand-navy text-primary-foreground shadow-[0_18px_50px_rgb(10_35_58/0.2)]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4 md:h-22">
          <AissaBrand logoVariant="light" />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sandstone",
                    active
                      ? "bg-primary-foreground text-brand-navy shadow-sm"
                      : "text-primary-foreground/82 hover:bg-white/12 hover:text-primary-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            className="rounded-md border border-white/25 bg-white/8 p-2 text-primary-foreground transition hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sandstone md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <nav className="grid gap-2 border-t border-white/15 py-4 md:hidden">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sandstone",
                    active
                      ? "bg-primary-foreground text-brand-navy"
                      : "text-primary-foreground/84 hover:bg-white/12 hover:text-primary-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
