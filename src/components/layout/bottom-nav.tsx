
"use client";

import { Home, ListChecks, Stethoscope, MoreHorizontal, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/activity", icon: ListChecks, label: "Activity" },
  { href: "/doctor", icon: Stethoscope, label: "Doctor" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/more", icon: MoreHorizontal, label: "More" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-xs"
            >
              <div className={cn(
                "p-2 rounded-full transition-all",
                isActive ? "bg-accent/20" : ""
              )}>
                <item.icon className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-accent" : "text-muted-foreground"
                  )} />
              </div>
              <span className={cn(
                  "transition-colors",
                  isActive ? "text-accent font-semibold" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
