
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Video, AlertTriangle, Calendar, Clock, User, Loader2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    appointmentDate: string;
    appointmentTime: string;
    createdAt: Timestamp;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'ringing';
}

const AppointmentSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
    </div>
);


export default function AppointmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming');
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.isGuest) {
            setIsLoading(false);
            return;
        }

        const q = query(
            collection(db, 'appointments'),
            where('patientId', '==', user.id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAppointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Appointment));
            setAppointments(fetchedAppointments);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching appointments:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);
    
    const handleJoinCall = async (appointmentId: string) => {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        try {
            // Set status to 'ringing' to notify the doctor
            await updateDoc(appointmentRef, { status: 'ringing' });
            toast({ title: "Ringing Doctor...", description: "Please wait while we connect you." });
            // Navigate to the call page
            router.push(`/call/${appointmentId}`);
        } catch (error) {
            console.error("Failed to start call:", error);
            toast({ variant: 'destructive', title: 'Call Failed', description: 'Could not connect to the doctor.' });
        }
    };
    
    const handleCancelAppointment = async (appointmentId: string) => {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        try {
            await updateDoc(appointmentRef, { status: 'cancelled' });
            toast({ title: "Appointment Cancelled" });
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
            toast({ variant: 'destructive', title: 'Cancellation Failed' });
        }
    }

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'confirmed':
                return <Badge variant="default" className="bg-green-500">Confirmed</Badge>;
            case 'ringing':
                 return <Badge variant="default" className="bg-yellow-500 animate-pulse">Ringing...</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-500">Pending</Badge>;
            case 'completed':
                 return <Badge variant="outline">Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    const filteredAppointments = appointments.filter(appt => {
        const isPast = new Date(appt.appointmentDate) < new Date();
        if (filter === 'upcoming') return !isPast && (appt.status === 'pending' || appt.status === 'confirmed' || appt.status === 'ringing');
        if (filter === 'past') return isPast || appt.status === 'completed' || appt.status === 'cancelled';
        return true;
    });


    if(authLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (user?.isGuest) {
        return (
            <div className="flex flex-col h-screen bg-background">
              <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-6 w-6" /></Button>
                <h1 className="text-xl font-bold">My Appointments</h1>
                <div className="w-8" />
              </header>
              <main className="flex-1 flex items-center justify-center p-4">
                  <Card className="text-center p-10">
                      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                      <h3 className="text-xl font-semibold mt-4">Login Required</h3>
                      <p className="text-muted-foreground">Please log in to see your appointments.</p>
                      <Button asChild className="mt-4"><a href="/login">Login</a></Button>
                  </Card>
              </main>
          </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">My Appointments</h1>
                <div className="w-8" />
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                 <Tabs value={filter} onValueChange={setFilter}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past & Cancelled</TabsTrigger>
                    </TabsList>
                </Tabs>

                {isLoading ? (
                    <AppointmentSkeleton />
                ) : filteredAppointments.length === 0 ? (
                    <Card className="text-center p-10 mt-6">
                        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No Appointments Found</h3>
                        <p className="text-muted-foreground">You have no {filter} appointments.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map(appt => (
                            <Card key={appt.id}>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg">Dr. {appt.doctorName}</p>
                                            <p className="text-sm text-primary">{appt.doctorSpecialty}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(appt.appointmentDate), 'PPP')}</span>
                                                <Clock className="h-4 w-4" />
                                                <span>{appt.appointmentTime}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(appt.status)}
                                    </div>

                                    {(appt.status === 'confirmed' || appt.status === 'ringing') && (
                                        <Button className="w-full" onClick={() => handleJoinCall(appt.id)} disabled={appt.status === 'ringing'}>
                                            <Video className="mr-2 h-4 w-4"/> {appt.status === 'ringing' ? 'Connecting...' : 'Join Call'}
                                        </Button>
                                    )}
                                    {appt.status === 'pending' && (
                                        <Button variant="destructive" className="w-full" onClick={() => handleCancelAppointment(appt.id)}>
                                            <X className="mr-2 h-4 w-4" /> Cancel Appointment
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
