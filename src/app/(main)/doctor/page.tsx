
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, User as AuthUser } from '@/context/auth-context';
import { Bell, Search, Video, Calendar, Clock, Star, Bookmark, Loader2, Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Doctor extends AuthUser {
    id: string;
}

interface Appointment {
  id: string;
  doctor: {
    name: string;
    specialty: string;
    image: string;
  };
  appointmentDate: string;
  appointmentTime: string;
}

const specialties = ['All', 'Cardiology', 'Dermatology', 'Pediatrician', 'Neurologist'];

function DoctorPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  useEffect(() => {
    setIsLoading(true);
    let q = query(collection(db, 'doctors'));

    if (selectedSpecialty !== 'All') {
      q = query(q, where('specialty', '==', selectedSpecialty));
    }
    
    q = query(q, limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDoctors = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          photoURL: `https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2F${doc.id}.png?alt=media`
      } as Doctor));
      setDoctors(fetchedDoctors);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching doctors: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedSpecialty]);

  useEffect(() => {
    if (user?.id) {
        const q = query(
            collection(db, 'appointments'),
            where('patientId', '==', user.id),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const upcoming = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(appt => ['confirmed', 'pending'].includes(appt.status));

            if (upcoming.length > 0) {
                const apptData = upcoming[0];
                setUpcomingAppointment({
                    id: apptData.id,
                    doctor: {
                        name: apptData.doctorName,
                        specialty: apptData.doctorSpecialty,
                        image: `https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2F${apptData.doctorId}.png?alt=media`
                    },
                    appointmentDate: format(new Date(apptData.appointmentDate), 'dd MMM, EEEE'),
                    appointmentTime: apptData.appointmentTime,
                });
            } else {
                setUpcomingAppointment(null);
            }
        });
        return () => unsubscribe();
    }
  }, [user]);

   const handleStartChat = async (doctor: Doctor) => {
        if (!user || user.isGuest) {
            toast({ variant: 'destructive', title: 'Please login to chat.'});
            return;
        }

        const chatId = [user.id, doctor.id].sort().join('_');
        const chatDocRef = doc(db, 'chats', chatId);
        
        try {
            const chatDoc = await getDoc(chatDocRef);
            if (!chatDoc.exists()) {
                await setDoc(chatDocRef, {
                    participants: [user.id, doctor.id],
                    participantDetails: {
                        [user.id]: {
                            name: `${user.firstName} ${user.lastName}`,
                            photoURL: user.photoURL || null,
                        },
                        [doctor.id]: {
                            name: doctor.displayName,
                            photoURL: doctor.photoURL || null,
                        },
                    },
                    lastMessage: 'Chat initiated',
                    lastMessageTimestamp: serverTimestamp(),
                });
            }
            router.push(`/chat/${chatId}`);
        } catch(error) {
            console.error("Error starting chat:", error);
            toast({ variant: 'destructive', title: 'Failed to start chat.'});
        }
    };


  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.photoURL || undefined} alt={user?.firstName} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Good morning!</p>
              <p className="font-bold text-lg">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
        </header>

        <h1 className="text-3xl font-bold tracking-tight">
          How are you feeling
          <br />
          today?
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Mic className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search a doctor, medicins, etc..."
            className="w-full h-14 pl-12 pr-12 rounded-full border border-border bg-card"
          />
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointment && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Upcoming Appointments</h2>
            <Link
              href="/appointments"
              className="text-sm font-semibold text-primary"
            >
              View All
            </Link>
          </div>
          <Card className="bg-primary text-primary-foreground p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={upcomingAppointment.doctor.image} />
                    <AvatarFallback>
                      {upcomingAppointment.doctor.name.charAt(4)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{upcomingAppointment.doctor.name}</p>
                    <p className="text-sm opacity-80">
                      {upcomingAppointment.doctor.specialty}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 rounded-full h-10 w-10 hover:bg-white/30"
                >
                  <Video className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm bg-primary-foreground/10 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{upcomingAppointment.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{upcomingAppointment.appointmentTime}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="bg-white/90 text-primary hover:bg-white">
                  Re-Schedule
                </Button>
                <Button variant="outline" className="bg-transparent border-white/50 hover:bg-white/20 hover:text-white" onClick={() => router.push(`/doctor`)}>
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Popular Doctors */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Popular Doctors</h2>
            <Link href="/doctor" className="text-sm font-semibold text-primary">
              View All
            </Link>
          </div>

          <div className="flex gap-2">
            {specialties.map((s, i) => (
              <Button
                key={s}
                variant={selectedSpecialty === s ? 'default' : 'secondary'}
                className="rounded-full"
                onClick={() => setSelectedSpecialty(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {isLoading ? (
                Array.from({length: 2}).map((_, i) => (
                    <Card key={i} className="p-4"><div className="flex items-center gap-4"><div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div><div className="space-y-2"><div className="h-5 w-32 bg-muted animate-pulse"></div><div className="h-4 w-24 bg-muted animate-pulse"></div></div></div></Card>
                ))
            ) : doctors.length > 0 ? (
                doctors.map((doc) => (
                <Card key={doc.id} className="p-4">
                    <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4" onClick={() => router.push(`/doctor/${doc.id}/book`)}>
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={doc.photoURL} />
                            <AvatarFallback>
                                {doc.displayName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg">{doc.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                            {doc.specialty}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold">{doc.rating || 4.9}</span>
                            <span className="text-sm text-muted-foreground">
                                ({Math.floor(Math.random() * 100) + 50} Reviews)
                            </span>
                            </div>
                        </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleStartChat(doc)}>
                              <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon">
                              <Bookmark className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                ))
            ) : (
                <Card className="p-4 text-center text-muted-foreground">No doctors found for this specialty.</Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <DoctorPageContent />
    </Suspense>
  );
}

    