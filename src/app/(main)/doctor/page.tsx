
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Video, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCalls } from "@/hooks/use-calls";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  image: string;
  dataAiHint: string;
  isOnline: boolean;
}

export default function DoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalling, setIsCalling] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // NOTE: This is for demonstration to show the hook works.
  // In a real app, this would be in the DOCTOR'S application.
  const { calls: incomingCalls } = useCalls(user?.id || '');

  useEffect(() => {
    if (incomingCalls.length > 0) {
        console.log("Incoming calls detected (for demo): ", incomingCalls);
        // Here, the doctor's app would show a notification.
    }
  }, [incomingCalls]);


  useEffect(() => {
    const doctorsQuery = query(collection(db, "doctors"), limit(12));
    const unsubscribe = onSnapshot(doctorsQuery, 
        (querySnapshot) => {
            const doctorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
            setDoctors(doctorsData);
            setIsLoading(false);
        }, 
        (error) => {
            console.error("Error fetching doctors: ", error);
            setDoctors([]);
            setIsLoading(false);
        }
    );
    
    return () => unsubscribe();
  }, []);

  const handleInitiateCall = async (doctor: Doctor) => {
      if (!user) {
          toast({ variant: 'destructive', title: "Login Required", description: "You must be logged in to book an appointment." });
          router.push('/login');
          return;
      }

      setIsCalling(doctor.id);

      try {
          const callData = {
              patientId: user.id,
              patientName: `${user.firstName} ${user.lastName}`,
              doctorId: doctor.id,
              doctorName: doctor.name || "Unnamed Doctor",
              doctorImage: doctor.image || "",
              doctorSpecialty: doctor.specialty || "N/A",
              status: "calling", // Status: calling, accepted, rejected, unanswered, completed
              createdAt: serverTimestamp(),
          };

          const docRef = await addDoc(collection(db, "calls"), callData);
          
          toast({
              title: "Calling Doctor",
              description: `Waiting for ${doctor.name || 'the doctor'} to respond.`,
          });

          // Navigate to the call status page
          router.push(`/call-status/${docRef.id}`);

      } catch (error) {
          console.error("Failed to initiate call:", error);
          toast({
              variant: "destructive",
              title: "Calling Failed",
              description: "There was a problem initiating your call. Please try again.",
          });
          setIsCalling(null);
      }
  }


  const getInitials = (name: string) => {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).join('');
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
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
          ))
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
                    <h3 className="font-bold text-lg">{doctor.name || 'Unnamed Doctor'}</h3>
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
                        className="w-full bg-green-600 hover:bg-green-700" 
                        disabled={!doctor.isOnline || !!isCalling}
                        onClick={() => handleInitiateCall(doctor)}
                    >
                        {isCalling === doctor.id ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calling...</>
                        ) : (
                            <><Video className="mr-2 h-4 w-4" /> Call Now</>
                        )}
                    </Button>
                </div>
                </CardContent>
            </Card>
            ))
        ) : (
            <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No doctors available at the moment. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
