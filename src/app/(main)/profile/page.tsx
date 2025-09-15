

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, ShoppingCart, ChevronRight, Edit, Camera, Languages } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { profileLinks } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/context/language-context";


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { cart } = useCart();
  const t = useTranslation();
  
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b border-border/80">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{t('profile.title')}</h1>
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

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="p-4 rounded-xl bg-card/80">
           {loading || !user ? (
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-10" />
                </div>
           ) : (
                <>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 text-xl">
                        <AvatarImage src={user.photoURL} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback className="bg-pink-500/30 text-pink-400">
                            {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold">{user.firstName} {user.lastName}</h2>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                    <Button size="icon" variant="outline" className="bg-primary/10 border-primary/50 text-primary" onClick={() => router.push('/profile/edit')}>
                        <Edit className="h-5 w-5" />
                    </Button>
                </div>
                 <Button variant="link" className="mt-2 text-yellow-400">
                    <Camera className="mr-2 h-4 w-4" />
                    {t('profile.changePhoto')}
                </Button>
                </>
           )}
        </div>


        <div className="space-y-3">
            {profileLinks.map((link) => {
              if (link.doctorOnly && !user?.isDoctor) {
                return null;
              }
              return (
                <Link href={link.href} key={link.textKey}>
                    <div className="flex items-center p-4 rounded-xl bg-card/80 hover:bg-card/50 transition-colors">
                        <div className="p-2 bg-gray-700/50 rounded-lg mr-4">
                            <link.icon className={`h-6 w-6 ${link.color}`} />
                        </div>
                        <span className="flex-1 font-semibold">{t(link.textKey)}</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Link>
              )
            })}
        </div>
      </main>
    </div>
  );
}

