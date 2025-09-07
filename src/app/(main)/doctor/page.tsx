
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent }d from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Video, CheckCircle, XCircle, Loader2, Bot } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { collection, addDoc, serverTimestamp, query, limit, startAfter, getDocs, orderBy, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCalls } from "@/hooks/use-calls";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  image: string;
  dataAiHint: string;
  isOnline: boolean;
}

const DOCTORS_PER_PAGE = 9;

export default function DoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);

  const [isCalling, setIsCalling] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const { calls: incomingCalls } = useCalls(user?.id || '');

  const { ref: loadMoreRef, entry } = useIntersectionObserver({
    threshold: 0.5,
  });
  
  useEffect(() => {
    if (incomingCalls.length > 0) {
        console.log("Incoming calls detected (for demo): ", incomingCalls);
    }
  }, [incomingCalls]);

  const fetchDoctors = useCallback(async (lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    if(lastVisibleDoc) setIsLoadingMore(true) 
    else setIsLoading(true);

    try {
      const doctorsQuery = lastVisibleDoc
        ? query(collection(db, "doctors"), orderBy("name"), startAfter(lastVisibleDoc), limit(DOCTORS_PER_PAGE))
        : query(collection(db, "doctors"), orderBy("name"), limit(DOCTORS_PER_PAGE));

      // Simulate network delay for loading skeletons
      if (!lastVisibleDoc) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const querySnapshot = await getDocs(doctorsQuery);
      const newDoctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      
      setDoctors(prev => lastVisibleDoc ? [...prev, ...newDoctors] : newDoctors);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === DOCTORS_PER_PAGE);

    } catch(error) {
      console.error("Error fetching doctors: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch doctors.' });
    } finally {
      if(lastVisibleDoc) setIsLoadingMore(false)
      else setIsLoading(false);
      isFetching.current = false;
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoadingMore) {
      fetchDoctors(lastDoc);
    }
  }, [entry, hasMore, isLoadingMore, fetchDoctors, lastDoc]);


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
              status: "calling",
              createdAt: serverTimestamp(),
          };

          const docRef = await addDoc(collection(db, "calls"), callData);
          
          toast({
              title: "Calling Doctor",
              description: `Waiting for ${doctor.name || 'the doctor'} to respond.`,
          });
          
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
  
  const renderSkeletons = () => (
    <>
        <div className="col-span-full flex flex-col items-center text-center space-y-2 py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary"/>
            <h2 className="text-xl font-semibold">Hang Up! Warming up</h2>
            <p className="text-muted-foreground">Finding available doctors for you...</p>
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
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
        ))}
    </>
  );

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
        {isLoading && doctors.length === 0 ? (
          renderSkeletons()
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
            !isLoading && <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No doctors available at the moment. Please check back later.</p>
            </div>
        )}
      </div>

       <div ref={loadMoreRef} className="col-span-full flex justify-center py-6">
        {isLoadingMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {!hasMore && doctors.length > 0 && <p className="text-muted-foreground">You've reached the end of the list.</p>}
      </div>
    </div>
  );
}
