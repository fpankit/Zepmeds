
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Siren, MapPin, AlertTriangle, ShieldCheck, Phone, MessageSquare, Loader2, LocateFixed, Edit, WifiOff, ShieldAlert, Ambulance, Flame, Footprints, Baby } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const EditAddressDialog = dynamic(() => import('@/components/features/edit-address-dialog').then(mod => mod.EditAddressDialog), { 
    ssr: false,
});

const RIDER_ARRIVAL_TIME = 10 * 60; // 10 minutes in seconds

const LiveEmergencyMap = dynamic(() => import('@/components/features/live-emergency-map').then(mod => mod.LiveEmergencyMap), { 
    ssr: false,
    loading: () => <div className="h-48 w-full rounded-md bg-muted/30 animate-pulse" />
});

const emergencyNumbers = [
    { name: "National Emergency", number: "112", icon: ShieldAlert, color: "text-red-400" },
    { name: "Police", number: "100", icon: ShieldCheck, color: "text-blue-400" },
    { name: "Fire Brigade", number: "101", icon: Flame, color: "text-orange-400" },
    { name: "Ambulance", number: "102 / 108", icon: Ambulance, color: "text-rose-400" },
    { name: "Women Helpline", number: "1091", icon: Footprints, color: "text-pink-400" },
    { name: "Child Helpline", number: "1098", icon: Baby, color: "text-sky-400" },
];


export default function EmergencyPage() {
  const [isDispatched, setIsDispatched] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [countdown, setCountdown] = useState(RIDER_ARRIVAL_TIME);

  const [emergencyDetails, setEmergencyDetails] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const defaultAddress = user?.addresses?.[0]?.address || "741/2, Gurugram, Haryana, 122001";
  const [location, setLocation] = useState(defaultAddress);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>({lat: 28.4595, lng: 77.0266}); // Default to Gurugram

  useEffect(() => {
    // If user data is available (even from localStorage), set the location.
    if (user?.addresses?.[0]?.address) {
      setLocation(user.addresses[0].address);
    }
  }, [user]);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial status
    if (typeof navigator.onLine !== 'undefined') {
        setIsOffline(!navigator.onLine);
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isDispatchDisabled = confirmationText !== "Help" || isLoading;

  const handleFetchLocation = () => {
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error("Failed to fetch address.");

          const data = await response.json();
          if (!data.display_name) throw new Error("Address not found.");
          
          setLocation(data.display_name);
          toast({
              title: "Location Updated",
              description: "Your current location has been set.",
          });
        } catch (error) {
            console.error("Reverse geocoding error: ", error);
            toast({ variant: "destructive", title: "Could not fetch address details." });
        } finally {
            setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error: ", error.message);
        toast({
            variant: "destructive",
            title: "Geolocation Failed",
            description: "Please enable location permissions in your browser.",
        });
        setIsFetchingLocation(false);
      }
    );
  };


  const handleDispatch = async () => {
    if (!user || user.isGuest) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to dispatch an emergency.",
        });
        router.push('/login');
        return;
    }

    setIsLoading(true);
    
    setIsDispatched(true);

    try {
        await addDoc(collection(db, "emergencies"), {
            emergencyDetails,
            additionalNotes,
            location,
            userName: user.firstName + ' ' + user.lastName,
            userPhone: user.phone,
            userCoords: userCoords,
            status: "dispatched",
            createdAt: serverTimestamp(),
        });
       
        toast({
            title: isOffline ? "Request Queued" : "Request Sent",
            description: isOffline 
                ? "You are offline. Your emergency request will be sent automatically when you reconnect."
                : "Help is on the way. Your request will be processed immediately.",
        });

    } catch (error) {
        console.error("Failed to dispatch emergency:", error);
        setIsDispatched(false);
        toast({
            variant: "destructive",
            title: "Dispatch Failed",
            description: "Could not send request. Please check your connection and try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDispatched) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isDispatched]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSaveAddress = (newAddress: string) => {
    setLocation(newAddress);
    setIsEditAddressOpen(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
        {!isDispatched ? (
          <div
            key="form"
          >
            <Card className="border-red-500 border-2 shadow-lg shadow-red-500/20">
              <CardHeader className="text-center bg-red-500/10">
                <Siren className="mx-auto h-12 w-12 text-red-500 animate-pulse" />
                <CardTitle className="text-2xl font-bold text-red-400">Emergency Request</CardTitle>
                <CardDescription className="text-yellow-400/80">
                  This service works offline. Your request will be sent automatically upon reconnection.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {isOffline && (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/50 text-yellow-300">
                        <WifiOff className="h-5 w-5"/>
                        <p className="text-sm font-semibold">You are currently offline. Your request will be queued.</p>
                    </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="emergency-details" className="text-red-400">Describe the Emergency</Label>
                  <Textarea id="emergency-details" placeholder="e.g., 'Chest pain and difficulty breathing'" rows={3} className="bg-card/50 focus:ring-red-500" value={emergencyDetails} onChange={(e) => setEmergencyDetails(e.target.value)} />
                </div>

                <div className="space-y-2">
                   <Label className="text-red-400">Your Location</Label>
                   <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 rounded-md border border-input p-3 bg-card/50">
                            <MapPin className="h-5 w-5 text-yellow-500 flex-shrink-0"/>
                            <p className="flex-1 text-sm">{location}</p>
                            <Button variant="ghost" size="icon" className="text-yellow-500" onClick={() => setIsEditAddressOpen(true)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-yellow-500 self-start" onClick={handleFetchLocation} disabled={isFetchingLocation || isOffline}>
                             {isFetchingLocation ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LocateFixed className="h-4 w-4 mr-2" />}
                            {isOffline ? "Cannot fetch location while offline" : "Use Current Location"}
                        </Button>
                        <EditAddressDialog
                            isOpen={isEditAddressOpen}
                            onClose={() => setIsEditAddressOpen(false)}
                            currentAddress={location}
                            onSave={handleSaveAddress}
                        />
                   </div>
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="notes" className="text-red-400">Additional Notes</Label>
                  <Textarea id="notes" placeholder="e.g., 'Patient is allergic to penicillin'" rows={2} className="bg-card/50 focus:ring-red-500" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} />
                </div>
                
                <Card className="bg-yellow-500/10 border-yellow-500 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400"/>
                        <h4 className="font-bold text-yellow-300">Confirmation Required</h4>
                    </div>
                    <p className="text-xs text-yellow-400/80">To prevent accidental dispatches, please type 'Help' in the box below.</p>
                     <Input 
                        placeholder="Type 'Help' to enable dispatch"
                        className="bg-card/80 border-yellow-500/50 focus:ring-yellow-500"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                    />
                </Card>

                <Button 
                    className={cn(
                        "w-full text-lg font-bold py-6 bg-red-600 hover:bg-red-700 text-white transition-all duration-300",
                        isDispatchDisabled && "bg-gray-500/50 cursor-not-allowed",
                        !isDispatchDisabled && "animate-pulse"
                    )}
                    disabled={isDispatchDisabled}
                    onClick={handleDispatch}
                 >
                    {isLoading ? <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div> Sending Request...</> : <><Siren className="mr-2 h-6 w-6"/> Dispatch Emergency Services</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div
            key="status"
            className="space-y-6"
          >
            <div className="relative z-10">
                <Card className="border-yellow-400 border-2 bg-black/50 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <ShieldCheck className="mx-auto h-12 w-12 text-yellow-400" />
                        <CardTitle className="text-2xl font-bold text-yellow-300">HELP IS ON THE WAY</CardTitle>
                        <CardDescription className="text-yellow-200/80">
                         An ambulance has been dispatched to your location. Stay calm.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <p className="text-yellow-300">Estimated Arrival In:</p>
                            <p className="text-5xl font-bold text-white">{formatTime(countdown)}</p>
                        </div>
                        <Progress value={100 - (countdown / RIDER_ARRIVAL_TIME) * 100} className="h-4 [&>*]:bg-gradient-to-r [&>*]:from-yellow-400 [&>*]:to-red-500" />
                    </CardContent>
                </Card>

                <Card className="mt-6 border-muted bg-black/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-yellow-300">Live Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {userCoords && <LiveEmergencyMap userPosition={userCoords} />}
                    </CardContent>
                </Card>

                <Card className="mt-6 border-muted bg-black/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-yellow-300">Ambulance Details</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12 border-2 border-yellow-400">
                                <AvatarImage src="https://picsum.photos/200/200?random=35" alt="Driver" data-ai-hint="person portrait"/>
                                <AvatarFallback>DL</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-white">Driver: Karan Singh</p>
                                <p className="text-sm text-yellow-200/80">DL12 AB 3456</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="bg-yellow-400/20 border-yellow-400 text-yellow-300"><Phone /></Button>
                            <Button size="icon" variant="outline" className="bg-yellow-400/20 border-yellow-400 text-yellow-300"><MessageSquare /></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        )}

        <Card>
            <CardHeader>
                <CardTitle>National Emergency Numbers</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {emergencyNumbers.map(service => (
                    <a key={service.name} href={`tel:${service.number.split(' ')[0]}`}>
                        <Card className="hover:bg-card/50 transition-colors">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <service.icon className={cn("h-8 w-8 mb-2", service.color)} />
                                <p className="font-bold">{service.name}</p>
                                <p className="text-lg font-mono font-semibold text-muted-foreground">{service.number}</p>
                            </CardContent>
                        </Card>
                    </a>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}

    