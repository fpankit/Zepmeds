"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Video, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  image: string;
  isOnline: boolean;
  dataAiHint?: string;
}


const DoctorCardSkeleton = () => (
    <Card className="overflow-hidden">
        <CardContent className="p-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
        <div className="flex gap-2 mt-4">
            <Skeleton className="h-10 w-full" />
        </div>
        </CardContent>
    </Card>
);

export default function DoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingLink, setIsCreatingLink] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleToggleOnline = async () => {
      if (!user || !user.isDoctor) return;
      
      const doctorDocRef = doc(db, 'doctors', user.id);
      const newStatus = !user.isOnline;
      await updateDoc(doctorDocRef, { isOnline: newStatus });
      
      // Also update the local user state for immediate UI feedback
      updateUser({ isOnline: newStatus });

      toast({ title: `You are now ${newStatus ? 'online' : 'offline'}.` });
  };

  useEffect(() => {
    setIsLoading(true);
    const doctorsQuery = query(collection(db, "doctors"));

    const unsubscribe = onSnapshot(doctorsQuery, (querySnapshot) => {
        const fetchedDoctors = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                name: data.displayName || "Unnamed Doctor",
                specialty: data.specialty || "No Specialty",
                experience: data.about || "No experience listed.",
                image: data.photoURL || "",
                dataAiHint: "doctor portrait",
                isOnline: data.isOnline || false,
             } as Doctor
        });
        
        fetchedDoctors.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return a.name.localeCompare(b.name);
        });

        setDoctors(fetchedDoctors);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching doctors with real-time listener: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch doctors. Please ensure Firestore permissions are correct.' });
        setIsLoading(false);
    });

    return () => {
        unsubscribe();
    };
  }, [toast]);


  const getInitials = (name: string) => {
    if (!name) return 'Dr';
    const parts = name.split(' ');
    if(parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name.substring(0,2);
  }

  const handleVideoCall = async (doctor: Doctor) => {
    if (!user || user.isGuest) {
        toast({ variant: "destructive", title: "Please login to start a call." });
        router.push('/login');
        return;
    }
    setIsCreatingLink(doctor.id);
    try {
        // Create a call document in Firestore to act as the "room"
        const callDocRef = await addDoc(collection(db, 'video_calls'), {
            patientId: user.id,
            patientName: `${user.firstName} ${user.lastName}`,
            doctorId: doctor.id,
            doctorName: doctor.name,
            status: 'ringing', // The doctor can be notified immediately
            createdAt: serverTimestamp(),
        });
        
        // The document ID becomes our unique room ID for Jitsi
        router.push(`/call/${callDocRef.id}`);

    } catch (error: any) {
        console.error("Failed to start video call process:", error);
        toast({
            variant: "destructive",
            title: "Failed to start call",
            description: "Could not create a consultation room.",
        });
        setIsCreatingLink(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <Stethoscope className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold">Consult a Doctor</h1>
        <p className="text-muted-foreground">
          Book an appointment or start a video call with our top-rated doctors.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by doctor or specialty" className="pl-10" />
      </div>

      {user?.isDoctor && (
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Doctor Mode</h3>
            <p className="text-sm text-muted-foreground">You are currently {user.isOnline ? 'online' : 'offline'}.</p>
          </div>
          <Button onClick={handleToggleOnline} variant={user.isOnline ? "destructive" : "default"}>
            {user.isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && doctors.length === 0 ? (
            Array.from({ length: 6 }).map((_, index) => <DoctorCardSkeleton key={index} />)
        ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden">
                    <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4" style={{ borderColor: doctor.isOnline ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
                            <AvatarImage src={doctor.image} alt={doctor.name} data-ai-hint={doctor.dataAiHint} />
                            <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                        <h3 className="font-bold text-lg">{doctor.name}</h3>
                        <p className="text-primary font-medium">{doctor.specialty}</p>
                        <p className="text-sm text-muted-foreground">
                            {doctor.experience}
                        </p>
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-semibold",
                            doctor.isOnline ? "text-green-500" : "text-red-500"
                        )}>
                            {doctor.isOnline ? <CheckCircle className="h-3 w-3"/> : <XCircle className="h-3 w-3"/>}
                            {doctor.isOnline ? "Online" : "Offline"}
                        </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button 
                            className="w-full" 
                            disabled={!doctor.isOnline || !!isCreatingLink}
                            onClick={() => handleVideoCall(doctor)}
                        >
                            {isCreatingLink === doctor.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Video className="mr-2 h-4 w-4" /> 
                            )}
                            {isCreatingLink === doctor.id ? 'Starting...' : 'Start Video Call'}
                        </Button>
                    </div>
                    </CardContent>
                </Card>
            ))
        ) : (
            !isLoading && <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No doctors available at the moment. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
