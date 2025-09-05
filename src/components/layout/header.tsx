import { MapPin, User, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '../icons/logo';
import { Input } from '../ui/input';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/home" className="mr-6 hidden items-center space-x-2 md:flex">
          <Logo className="h-8 w-auto text-primary" />
          <span className="font-headline text-xl font-bold">Zepmeds</span>
        </Link>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="hidden md:inline">New York, 10001</span>
          <span className="md:hidden">NYC</span>
        </div>

        <div className="mx-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for medicines..." className="w-full rounded-full bg-muted pl-10" />
          </div>
        </div>

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
