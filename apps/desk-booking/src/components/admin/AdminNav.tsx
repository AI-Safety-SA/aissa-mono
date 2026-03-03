"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "[]" },
  { href: "/admin/floor-plans", label: "Floor Plans", icon: "><" },
  { href: "/admin/desk-types", label: "Desk Types", icon: "{}" },
  { href: "/admin/bookings", label: "Bookings", icon: "||" },
  { href: "/admin/settings", label: "Settings", icon: "::" },
  { href: "/admin/webhooks", label: "Webhooks", icon: "->" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 bg-zinc-950 border-r border-teal-900/30 flex flex-col">
      <div className="p-4 border-b border-teal-900/30">
        <Link href="/" className="block">
          <h1 className="text-lg font-black bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
            Sanctuary<span className="text-teal-800">.</span>OS
          </h1>
          <p className="text-[10px] text-teal-700 font-mono tracking-wider mt-0.5">
            {"// ADMIN_CONSOLE"}
          </p>
        </Link>
      </div>

      <div className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-xs font-mono transition-all
                ${
                  isActive
                    ? "bg-teal-900/30 text-teal-300 border border-teal-800/40"
                    : "text-teal-700 hover:text-teal-400 hover:bg-teal-950/30"
                }
              `}
            >
              <span className="text-teal-600 w-5 text-center opacity-60">
                {item.icon}
              </span>
              <span className="uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-teal-900/30">
        <Link
          href="/"
          className="text-[10px] text-teal-800 font-mono hover:text-teal-500 transition-colors"
        >
          &lt;- BACK TO FLOOR PLAN
        </Link>
      </div>
    </nav>
  );
}
