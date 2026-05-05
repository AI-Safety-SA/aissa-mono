"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, GraduationCap, Home, Menu, MessageSquareQuote, X } from "lucide-react";
import { AissaBrand } from "./aissa-brand";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/programs", label: "Programs", icon: GraduationCap },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
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
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
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
            className="rounded-full border border-border p-2 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <nav className="grid gap-2 border-t border-primary/10 py-4 md:hidden">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-primary/5"
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
