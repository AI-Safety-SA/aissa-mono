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
import { ThemeToggle } from "./theme-toggle";
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
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/82 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4 md:h-22">
          <AissaBrand />
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
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[hsl(var(--brand-dark-surface))] text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/65 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <ThemeToggle />
          </nav>
          <button
            type="button"
            className="rounded-md border border-border bg-card/60 p-2 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <nav className="grid gap-2 border-t border-border/70 py-4 md:hidden">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/65"
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
