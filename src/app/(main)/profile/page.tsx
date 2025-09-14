
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bell, ShoppingCart, Edit, Camera, Package, Link as LinkIcon, Wallet, Ticket, MapPin, Home, Briefcase } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { cart } = useCart();

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  const savedLocations = user?.addresses?.slice(0, 2) || [
      { id: '1', type: 'Home', address: '123 Main Street, Apartment 4B, New York, NY 10001' },
      { id: '2', type: 'Work', address: '456 Business Ave, Suite 200, New York, NY 10002' },
  ];

  const locationIcons = {
      Home: <Home className="h-5 w-5 text-blue-400" />,
      Work: <Briefcase className="h-5 w-5 text-purple-400" />,
      Other: <MapPin className="h-5 w-5 text-gray-400" />,
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b border-border/80">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Bell className="h-6 w-6" />
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

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        ) : (
            <>
                {/* User Info Card */}
                <Card className="bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                         <Avatar className="h-16 w-16 text-xl bg-pink-500/30 text-pink-400">
                            <AvatarFallback>{user ? getInitials(user.firstName, user.lastName) : 'A'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg">{user ? `${user.firstName} ${user.lastName}` : 'Ankit'}</h2>
                            <p className="text-muted-foreground">{user?.phone || '+91 9718109948'}</p>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/profile/edit">
                                <Edit className="h-5 w-5 text-blue-400"/>
                            </Link>
                        </Button>
                    </CardContent>
                     <CardContent className="p-4 pt-0 border-t border-border">
                        <Button variant="link" className="p-0 text-yellow-400 h-auto">
                            <Camera className="mr-2 h-4 w-4" /> Change Profile Photo
                        </Button>
                    </CardContent>
                </Card>

                {/* Your Orders Card */}
                <Card className="bg-card/80">
                    <CardContent className="p-4 space-y-2">
                        <h3 className="font-bold">Your Orders</h3>
                        <p className="text-sm text-muted-foreground">Track your current order</p>
                        <Button className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold">
                            <Package className="mr-2 h-4 w-4"/> Track Your Order
                        </Button>
                    </CardContent>
                </Card>

                {/* Past Medications Card */}
                <Card className="bg-purple-900/40 border-purple-800">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2 font-bold">
                             <LinkIcon className="h-5 w-5 text-red-400 -rotate-45" />
                            <h3>Past Medications</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">View your discontinued medications</p>
                        <Button variant="secondary" className="w-full mt-2 bg-card/50 hover:bg-card/80">
                            View Past Medications
                        </Button>
                    </CardContent>
                </Card>

                {/* Wallet & Coupons */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-900/40 border-green-800">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-green-400" />
                                <h3 className="font-bold">Wallet</h3>
                            </div>
                            <p className="font-bold text-lg text-green-300">₹500</p>
                            <Button size="sm" variant="outline" className="bg-transparent border-green-700 hover:bg-green-800/50">View</Button>
                        </CardContent>
                    </Card>
                     <Card className="bg-yellow-900/40 border-yellow-800">
                        <CardContent className="p-4 space-y-2">
                             <div className="flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-yellow-400" />
                                <h3 className="font-bold">Coupons</h3>
                            </div>
                            <p className="font-bold text-lg text-yellow-300">4</p>
                            <Button size="sm" variant="outline" className="bg-transparent border-yellow-700 hover:bg-yellow-800/50">View</Button>
                        </CardContent>
                    </Card>
                </div>
                
                 {/* Saved Locations Card */}
                <Card className="bg-card/80">
                    <CardContent className="p-4 space-y-4">
                        <h3 className="font-bold">Saved Locations</h3>
                        <div className="space-y-4">
                        {savedLocations.map(location => (
                           <div key={location.id} className="flex items-center gap-3">
                                <div className="p-2 bg-gray-700/50 rounded-full">
                                    {locationIcons[location.type as keyof typeof locationIcons] || <MapPin className="h-5 w-5 text-gray-400" />}
                                </div>
                               <div>
                                    <p className="font-semibold">{location.type}</p>
                                    <p className="text-sm text-muted-foreground">{location.address}</p>
                                </div>
                           </div>
                        ))}
                        </div>
                        <Button variant="link" className="p-0 h-auto text-primary">Manage Addresses</Button>
                    </CardContent>
                </Card>
            </>
        )}
      </main>
    </div>
  );
}
