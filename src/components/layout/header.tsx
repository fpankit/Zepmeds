
"use client";

import { MapPin, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LocationSheet } from '../features/location-sheet';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <LocationSheet>
          <div className="flex cursor-pointer items-center gap-2 text-sm">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <div className="flex items-center font-bold">
                Home <ChevronDown className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                Ghh, Bnn, Gurugram, 122001
              </p>
            </div>
          </div>
        </LocationSheet>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
