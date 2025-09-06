
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Power } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { profileLinks, supportLinks } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";


export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col items-center space-y-4">
        {loading ? (
            <>
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="text-center space-y-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
            </>
        ) : (
            <>
                <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl">
                    {user ? getInitials(user.firstName, user.lastName) : 'GU'}
                </AvatarFallback>
                </Avatar>
                <div className="text-center">
                <h1 className="text-2xl font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</h1>
                <p className="text-muted-foreground">{user?.phone || 'No phone number'}</p>
                </div>
                <Button variant="outline" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
                </Button>
            </>
        )}
      </div>

      <Separator className="my-8" />
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {profileLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.href} className="flex items-center p-4 hover:bg-card/60">
                    <link.icon className="mr-4 h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 font-medium">{link.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

         <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {supportLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.href} className="flex items-center p-4 hover:bg-card/60">
                    <link.icon className="mr-4 h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 font-medium">{link.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleLogout} disabled={loading}>
          <Power className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
}
