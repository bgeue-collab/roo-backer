"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ListChecks, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/sponsors", label: "Sponsors", icon: Users, exact: true },
  { href: "/sponsors/actions", label: "Actions", icon: ListChecks, exact: false },
  { href: "/sponsors/settings", label: "Settings", icon: Settings, exact: false },
  { href: "/sponsors/help", label: "Help", icon: HelpCircle, exact: false },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t bg-background">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs",
              isActive ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
