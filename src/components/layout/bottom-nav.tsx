
"use client";

import React from "react";
import { Home, BarChart3, Star, MoreHorizontal, Activity, Users, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Badge } from "../ui/badge";
import { useTranslation } from "@/context/language-context";

const BottomNavComponent = () => {
  const pathname = usePathname();
  const { cart } = useCart();
  const t = useTranslation();

  const navItems = [
    { href: "/home", icon: Home, label: t('bottomNav.home') },
    { href: "/activity", icon: BarChart3, label: "Progress" },
    { href: "/asha", icon: Users, label: 'My Family' },
    { href: "/cart", icon: ShoppingCart, label: t('bottomNav.cart') },
    { href: "/more", icon: MoreHorizontal, label: t('bottomNav.more') },
  ];

  // A more robust check for activity page and its children
  const isActivityActive = pathname === '/activity' || pathname.startsWith('/activity/');
  const isFamilyActive = pathname === '/asha' || pathname.startsWith('/asha/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item, index) => {
          let isActive = pathname.startsWith(item.href) && item.href !== '/home';
          if (item.href === '/home' && pathname === '/home') isActive = true;
          if (item.href === '/activity') isActive = isActivityActive;
          if (item.href === '/asha') isActive = isFamilyActive;
          if (item.href === '/cart' && pathname.startsWith('/cart')) isActive = true;

          const isCenterButton = index === 2;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-xs w-1/5 relative"
            >
              <div className={cn(
                "p-2 rounded-lg transition-all relative flex items-center justify-center",
                 isCenterButton ? "h-12 w-12 rounded-full bg-green-400 text-white shadow-[0_4px_14px_rgba(74,222,128,0.5)] -translate-y-4" : "h-10 w-10",
                 isActive && !isCenterButton ? "text-primary" : "text-muted-foreground"
              )}>
                
                <item.icon className={cn(
                  "h-6 w-6 transition-colors",
                  isCenterButton && 'text-white'
                  )} />
                {item.href === '/cart' && cart.length > 0 && !isCenterButton && (
                    <Badge variant="destructive" className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                        {cart.length}
                    </Badge>
                )}
              </div>
              {!isCenterButton && (
                  <span className={cn(
                      "transition-colors text-xs -mt-1",
                      isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Convert HSL to RGB for the shadow color variable
const primaryColor = "243 78% 62%"; 
const hslToRgb = (hsl: string) => {
    const [h, s, l] = hsl.split(" ").map(val => parseFloat(val.replace('%', '')));
    const sat = s / 100;
    const light = l / 100;
    const c = (1 - Math.abs(2 * light - 1)) * sat;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = light - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else if (h >= 300 && h < 360) {
        [r, g, b] = [c, 0, x];
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `${r},${g},${b}`;
}

const primaryRgb = hslToRgb(primaryColor);

const BottomNavWithStyle = () => (
    <>
        <style jsx global>{`
            :root {
                --primary-rgb: ${primaryRgb};
            }
        `}</style>
        <BottomNavComponent />
    </>
)

export const BottomNav = React.memo(BottomNavWithStyle);
