
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, ShoppingCart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { profileLinks } from "@/lib/data";


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { cart } = useCart();

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b border-border/80">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <Link href="/cart" className="relative">
                 <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-6 w-6" />
                </Button>
                {cart.length > 0 && (
                     <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">{cart.length}</Badge>
                 )}
            </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {profileLinks.map((link) => (
            <Link href={link.href} key={link.text}>
                <div className="flex items-center p-4 rounded-xl bg-card/80 hover:bg-card/50 transition-colors">
                    <div className="p-2 bg-gray-700/50 rounded-lg mr-4">
                        <link.icon className={`h-6 w-6 ${link.color}`} />
                    </div>
                    <span className="flex-1 font-semibold">{link.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
            </Link>
        ))}
      </main>
    </div>
  );
}
