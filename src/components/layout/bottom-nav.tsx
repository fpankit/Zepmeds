
"use client";

import React from "react";
import { Home, Stethoscope, MoreHorizontal, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Badge } from "../ui/badge";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/doctor", icon: Stethoscope, label: "Doctor" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/more", icon: MoreHorizontal, label: "More" },
];

function BottomNavComponent() {
  const pathname = usePathname();
  const { cart } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-xs w-1/5"
            >
              <div className={cn(
                "p-2 rounded-full transition-all relative",
                isActive ? "bg-accent/20" : ""
              )}>
                 {isActive && item.label !== 'Cart' && <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></div>}

                 {item.label === 'Cart' && cart.length > 0 && (
                     <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">{cart.length}</Badge>
                 )}
                
                <item.icon className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                  )} />
              </div>
              <span className={cn(
                  "transition-colors text-xs",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const BottomNav = React.memo(BottomNavComponent);
