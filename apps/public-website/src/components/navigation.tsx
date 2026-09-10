import { AissaBrand } from "./aissa-brand";

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-brand-navy text-primary-foreground shadow-navigation">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center md:h-22">
          <AissaBrand logoVariant="light" priority />
        </div>
      </div>
    </header>
  );
}
