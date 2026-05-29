import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconText({
  children,
  className,
  icon: Icon,
  iconClassName,
}: {
  children: ReactNode;
  className?: string;
  icon: LucideIcon;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0 text-primary", iconClassName)}
        aria-hidden="true"
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
