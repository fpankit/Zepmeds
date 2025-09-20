
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth, User } from '@/context/auth-context';
import { Loader2, ArrowLeft, Calendar, Check, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';


const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i < 18; i += 2) {
        const start = `${i}:00`;
        const end = `${i + 2}:00`;
        slots.push(`${start} - ${end}`);
    }
    return slots;
};

const timeSlots = generateTimeSlots();

const DoctorBookingSkeleton = () => (
    <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
            </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
    </div>
)

export default function BookAppointmentPage() {
    const params = useParams();
    const router = useRouter();
    const { id: doctorId } = params;
    const { user } = useAuth();
    const { toast } = useToast();

    const [doctor, setDoctor] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
    }, []);

    useEffect(() => {
        if (!doctorId) {
            router.push('/doctor');
            return;
        }
        
        const fetchDoctor = async () => {
            try {
                const docRef = doc(db, 'doctors', doctorId as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctor({ id: docSnap.id, ...docSnap.data() } as User);
                } else {
                    toast({ variant: 'destructive', title: 'Doctor not found.' });
                    router.push('/doctor');
                }
            } catch (error) {
                console.error("Error fetching doctor:", error);
                toast({ variant: 'destructive', title: 'Failed to load doctor details.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctor();
    }, [doctorId, router, toast]);

    const handleBooking = async () => {
        if (!user || user.isGuest) {
            toast({ variant: 'destructive', title: 'Please log in to book.' });
            return;
        }
        if (!selectedTime) {
            toast({ variant: 'destructive', title: 'Please select a time slot.' });
            return;
        }
        if (!doctor) return;

        setIsBooking(true);
        try {
            await addDoc(collection(db, 'appointments'), {
                patientId: user.id,
                patientName: `${user.firstName} ${user.lastName}`,
                doctorId: doctor.id,
                doctorName: doctor.displayName,
                doctorSpecialty: doctor.specialty || 'General Physician',
                appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
                appointmentTime: selectedTime,
                status: 'pending', // pending, confirmed, cancelled
                createdAt: serverTimestamp()
            });

            toast({
                title: 'Appointment Booked!',
                description: `Your request has been sent to Dr. ${doctor.displayName}.`,
            });
            router.push('/appointments');
        } catch (error) {
            console.error("Error booking appointment: ", error);
            toast({ variant: 'destructive', title: 'Booking Failed', description: 'Could not book the appointment. Please try again.' });
        } finally {
            setIsBooking(false);
        }
    };
    
    const getInitials = (name: string) => {
        if (!name) return 'Dr';
        return name.split(' ').map(n => n[0]).join('');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen">
                <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-6 w-6" /></Button>
                </header>
                <DoctorBookingSkeleton />
            </div>
        )
    }

    if (!doctor) return null;

    return (
        <div className="flex flex-col h-screen">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Book Appointment</h1>
                <div className="w-8"></div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={doctor.photoURL} alt={doctor.displayName} />
                            <AvatarFallback className="text-2xl">{getInitials(doctor.displayName || '')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>Dr. {doctor.displayName}</CardTitle>
                            <CardDescription>{doctor.specialty || 'General Physician'}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Calendar className="h-5 w-5" /> Select a Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 overflow-x-auto pb-4">
                        {dates.map(date => (
                            <button key={date.toString()} onClick={() => setSelectedDate(date)} className={cn(
                                "p-2 border rounded-lg text-center min-w-[60px]",
                                format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-card hover:bg-muted"
                            )}>
                                <p className="text-sm">{format(date, 'EEE')}</p>
                                <p className="font-bold text-lg">{format(date, 'd')}</p>
                                <p className="text-xs">{format(date, 'MMM')}</p>
                            </button>
                        ))}
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Clock className="h-5 w-5" /> Select a Time Slot
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {timeSlots.map(slot => (
                            <Button
                                key={slot}
                                variant={selectedTime === slot ? 'default' : 'outline'}
                                onClick={() => setSelectedTime(slot)}
                            >
                                {selectedTime === slot && <Check className="mr-2 h-4 w-4" />}
                                {slot}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

            </main>
            <footer className="p-4 border-t bg-background">
                <Button className="w-full text-lg" size="lg" onClick={handleBooking} disabled={!selectedTime || isBooking}>
                    {isBooking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {isBooking ? 'Booking...' : `Book for ${format(selectedDate, 'd MMM')} at ${selectedTime || '...'}`}
                </Button>
            </footer>
        </div>
    )
}
