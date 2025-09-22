

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Video, CheckCircle, XCircle, Loader2, Star, Calendar, Clock } from "lucide-react";
import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { collection, query, onSnapshot, doc, setDoc, getDocs, where, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, User as AuthUser } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const specialties = [
    { name: "All", key: "all" },
    { name: "Dermatologist", key: "dermatologist" },
    { name: "Pediatrician", key: "pediatrician" },
    { name: "General Physician", key: "general physician" },
    { name: "Dietician", key: "dietician" },
    { name: "Urologist", key: "urologist" },
    { name: "Cardiologist", key: "cardiologist" },
    { name: "Neurologist", key: "neurologist" },
];


interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

const DoctorCardSkeleton = () => (
    <Card className="overflow-hidden">
        <CardContent className="p-4">
        <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-4 pt-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const { user, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const specialtyFilter = searchParams.get('specialty');
  const { toast } = useToast();

  useEffect(() => {
    if(specialtyFilter) {
      setSearchQuery(specialtyFilter);
      const matchingSpecialty = specialties.find(s => s.name.toLowerCase() === specialtyFilter.toLowerCase());
      if (matchingSpecialty) {
          setSelectedSpecialty(matchingSpecialty.key);
      }
    }
  }, [specialtyFilter]);

  const handleToggleOnline = async () => {
      if (!user || !user.isDoctor) return;
      
      const newStatus = !user.isOnline;
      await updateUser({ isOnline: newStatus });

      toast({ title: `You are now ${newStatus ? 'online' : 'offline'}.` });
  };
  
  useEffect(() => {
    setIsLoading(true);
    const doctorsQuery = query(collection(db, "doctors"));
    
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (querySnapshot) => {
        const fetchedDoctors = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: data.uid || doc.id,
                displayName: data.displayName || `${data.firstName} ${data.lastName}`, 
                name: data.displayName || `${data.firstName} ${data.lastName}`,
                specialty: data.specialty || "General Physician",
                experience: data.experience || 5,
                rating: data.rating || 4.5,
                image: data.photoURL || "",
                dataAiHint: "doctor portrait",
                isOnline: data.isOnline || false,
             } as AuthUser
        });
        
        fetchedDoctors.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return (a.displayName || '').localeCompare(b.displayName || '');
        });

        setDoctors(fetchedDoctors);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching doctors in real-time: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch doctors.' });
        setIsLoading(false);
    });

    let unsubscribeAppointments = () => {};
    if (user && !user.isGuest) {
        const appointmentsQuery = query(collection(db, "appointments"), where("patientId", "==", user.id));
        unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
            const fetchedAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(fetchedAppointments);
        });
    }

    return () => {
        unsubscribeDoctors();
        unsubscribeAppointments();
    };
  }, [toast, user]);
  
  const filteredDoctors = useMemo(() => {
      return doctors.filter(doctor => {
        const matchesSearch = (doctor.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (doctor.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' || (doctor.specialty || '').toLowerCase() === selectedSpecialty;

        return matchesSearch && matchesSpecialty;
      });
  }, [doctors, searchQuery, selectedSpecialty]);


  const getInitials = (name: string) => {
    if (!name) return 'Dr';
    const parts = name.split(' ');
    if(parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name.substring(0,2);
  }

  const handleBookAppointment = (doctorId: string) => {
    if (!user || user.isGuest) {
        toast({ variant: "destructive", title: "Please login to book an appointment." });
        router.push('/login');
        return;
    }
    router.push(`/doctor/${doctorId}/book`);
  }

    const handleJoinCallFromDoctorPage = async (appointment: Appointment) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Login required' });
            return;
        }
        
        try {
            // Create a new call document in `zep_calls` to notify the doctor
            const callDocRef = await addDoc(collection(db, 'zep_calls'), {
                appointmentId: appointment.id,
                doctorId: appointment.doctorId,
                doctorName: appointment.doctorName,
                patientId: user.id,
                patientName: `${user.firstName} ${user.lastName}`,
                status: 'ringing',
                createdAt: serverTimestamp(),
            });
            
            toast({ title: "Ringing Doctor...", description: "Please wait while we connect you." });
            
            // Navigate to the call page with the *new call document ID*
            router.push(`/call/${callDocRef.id}`);
        } catch (error) {
            console.error("Failed to start call:", error);
            toast({ variant: 'destructive', title: 'Call Failed', description: 'Could not connect to the doctor.' });
        }
    };
  
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1 text-yellow-500">
        <Star className="w-4 h-4 fill-current" />
        <span className="text-sm font-semibold text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
  
  const getAppointmentButton = (doctor: AuthUser) => {
      if (!user || user.isGuest) {
          return (
              <Button className="w-full" onClick={() => handleBookAppointment(doctor.id)}>
                  <Calendar className="mr-2 h-4 w-4" /> 
                  Book Appointment
              </Button>
          )
      }

      const appointment = appointments.find(appt => appt.doctorId === doctor.id && (appt.status === 'pending' || appt.status === 'confirmed'));

      if (appointment) {
          if (appointment.status === 'pending') {
              return (
                  <Button className="w-full" disabled variant="outline">
                      <Clock className="mr-2 h-4 w-4 animate-spin" /> 
                      Pending Confirmation
                  </Button>
              )
          }
          if (appointment.status === 'confirmed') {
              return (
                  <Button className="w-full" onClick={() => handleJoinCallFromDoctorPage(appointment)}>
                      <Video className="mr-2 h-4 w-4" /> 
                      Start Video Call
                  </Button>
              )
          }
      }
      
      return (
           <Button className="w-full" onClick={() => handleBookAppointment(doctor.id)}>
                <Calendar className="mr-2 h-4 w-4" /> 
                Book Appointment
            </Button>
      )
  }

  if (authLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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
          placeholder="Search by doctor name..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

       <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-3">
            {specialties.map((specialty) => (
              <Button
                key={specialty.key}
                variant={selectedSpecialty === specialty.key ? 'default' : 'outline'}
                onClick={() => setSelectedSpecialty(specialty.key)}
                className="rounded-full"
              >
                {specialty.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>

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
                    <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20 border-4" style={{ borderColor: doctor.isOnline ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
                            <AvatarImage src={doctor.photoURL} alt={doctor.displayName} data-ai-hint={doctor.dataAiHint} />
                            <AvatarFallback>{getInitials(doctor.displayName || '')}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                            <h3 className="font-bold text-lg">{doctor.displayName}</h3>
                            <p className="text-primary font-medium">{doctor.specialty}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <StarRating rating={doctor.rating || 0} />
                                <span>{doctor.experience}+ yrs exp.</span>
                            </div>
                             <div className={cn(
                                "flex items-center gap-1 text-xs font-semibold pt-1",
                                doctor.isOnline ? "text-green-500" : "text-red-500"
                            )}>
                                {doctor.isOnline ? <CheckCircle className="h-3 w-3"/> : <XCircle className="h-3 w-3"/>}
                                {doctor.isOnline ? "Online" : "Offline"}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        {getAppointmentButton(doctor)}
                    </div>
                    </CardContent>
                </Card>
            ))
        ) : (
            !isLoading && <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No doctors found matching your criteria. Please check back later or broaden your search.</p>
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
