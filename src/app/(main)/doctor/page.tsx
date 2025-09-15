
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Video, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo, Suspense } from "react";
import { collection, query, onSnapshot, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, User as AuthUser } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


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

function DoctorPageContent() {
  const [doctors, setDoctors] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingLink, setIsCreatingLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const specialtyFilter = searchParams.get('specialty');
  const { toast } = useToast();

  useEffect(() => {
    if(specialtyFilter) {
      setSearchQuery(specialtyFilter);
    }
  }, [specialtyFilter]);

  const handleToggleOnline = async () => {
      if (!user || !user.isDoctor) return;
      
      const newStatus = !user.isOnline;
      await updateUser({ isOnline: newStatus });

      toast({ title: `You are now ${newStatus ? 'online' : 'offline'}.` });
  };

  useEffect(() => {
    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const doctorsQuery = query(collection(db, "doctors"));
            const querySnapshot = await getDocs(doctorsQuery);
            const fetchedDoctors = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: data.uid || doc.id,
                    displayName: data.displayName || `${data.firstName} ${data.lastName}`, 
                    name: data.displayName || `${data.firstName} ${data.lastName}`,
                    specialty: data.qualification || data.specialty || "No Specialty",
                    experience: data.about || "No experience listed.",
                    image: data.photoURL || "",
                    dataAiHint: "doctor portrait",
                    isOnline: data.isOnline || false,
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    age: data.age || 0,
                    addresses: data.addresses || [],
                    isDoctor: true,
                 } as AuthUser
            });
            
            fetchedDoctors.sort((a, b) => {
                if (a.isOnline && !b.isOnline) return -1;
                if (!a.isOnline && b.isOnline) return 1;
                return (a.displayName || '').localeCompare(b.displayName || '');
            });

            setDoctors(fetchedDoctors);
        } catch (error) {
            console.error("Error fetching doctors: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch doctors.' });
        } finally {
            setIsLoading(false);
        }
    }
    
    fetchDoctors();
    
    // Set up a real-time listener only for the current user's doctor status if they are a doctor
    let unsubscribe: Function | null = null;
    if(user && user.isDoctor) {
        const doctorDocRef = doc(db, "doctors", user.id);
        unsubscribe = onSnapshot(doctorDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                updateUser({ isOnline: data.isOnline });
            }
        });
    }

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [toast, user, updateUser]);
  
  const filteredDoctors = useMemo(() => {
      return doctors.filter(doctor => 
        (doctor.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialty || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [doctors, searchQuery]);


  const getInitials = (name: string) => {
    if (!name) return 'Dr';
    const parts = name.split(' ');
    if(parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name.substring(0,2);
  }

  const handleVideoCall = async (doctor: AuthUser) => {
    if (!user || user.isGuest) {
        toast({ variant: "destructive", title: "Please login to start a call." });
        router.push('/login');
        return;
    }
    setIsCreatingLink(doctor.id);
    
    try {
        const callDocRef = doc(collection(db, 'video_calls'));
        
        await setDoc(callDocRef, {
            patientId: user.id,
            patientName: `${user.firstName} ${user.lastName}`,
            doctorId: doctor.id,
            doctorName: doctor.displayName,
            status: 'ringing', // This is what the doctor app listens for
            createdAt: new Date().toISOString(),
        });
        
        // Navigate to a unique call page using our document ID
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
        <Input 
          placeholder="Search by doctor or specialty" 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
        {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <DoctorCardSkeleton key={index} />)
        ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden">
                    <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4" style={{ borderColor: doctor.isOnline ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
                            <AvatarImage src={doctor.photoURL} alt={doctor.displayName} data-ai-hint={doctor.dataAiHint} />
                            <AvatarFallback>{getInitials(doctor.displayName || '')}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                        <h3 className="font-bold text-lg">{doctor.displayName}</h3>
                        <p className="text-primary font-medium">{doctor.specialty}</p>
                        <p className="text-sm text-muted-foreground">
                            {doctor.about}
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
                <p className="text-muted-foreground">No doctors found for "{searchQuery}". Please check back later or broaden your search.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <DoctorPageContent />
        </Suspense>
    )
}
