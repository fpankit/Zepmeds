
"use client";

import { MapPin, User, ChevronDown, ShoppingCart, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const LocationSheet = dynamic(() => import('../features/location-sheet').then(mod => mod.LocationSheet), {
  ssr: false,
  loading: () => <Skeleton className="h-10 w-32" />
});

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Skeleton className="h-10 w-10" />;
  }

  return (
    <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
            <LocationSheet>
              <div className="flex cursor-pointer items-center gap-2 text-sm">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <div className="flex items-center font-semibold text-green-500">
                    Location <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </LocationSheet>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
