
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, User, Phone, MapPin, History, HeartPulse, FileText, LifeBuoy, Wallet, Tag, Power } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export const profileLinks = [
  { icon: User, text: "Personal Details", href: "/profile" },
  { icon: MapPin, text: "Addresses", href: "#" },
  { icon: History, text: "Order History", href: "/order-status" },
  { icon: HeartPulse, text: "Past Medicines", href: "#" },
  { icon: FileText, text: "Diagnosed Reports", href: "#" },
];

export const supportLinks = [
    { icon: Wallet, text: "Wallet", href: "#" },
    { icon: Tag, text: "Coupons & Offers", href: "#" },
    { icon: LifeBuoy, text: "Help & Support", href: "#" },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://picsum.photos/200" alt={user?.name || 'User'} data-ai-hint="person portrait" />
          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{user?.name || 'Guest User'}</h1>
          <p className="text-muted-foreground">{user?.phone || 'No phone number'}</p>
        </div>
        <Button variant="outline">Edit Profile</Button>
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

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <Power className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
}
