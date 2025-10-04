
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
import { Loader2, ArrowLeft, Star, Share, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';


const generateTimeSlots = () => {
    return ["8:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "2:00 PM"];
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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>("9:30 AM");

     const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
        const end = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

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
                    setDoctor({ id: docSnap.id, ...docSnap.data(), photoURL: `https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2F${docSnap.id}.png?alt=media` } as User);
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
                status: 'confirmed', // As per new design, it seems confirmed directly
                createdAt: serverTimestamp()
            });

            toast({
                title: 'Appointment Booked!',
                description: `Your appointment with Dr. ${doctor.displayName} is confirmed.`,
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
            <div className="flex flex-col h-screen bg-background">
                <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-6 w-6" /></Button>
                    <Button variant="ghost" size="icon"><Share className="h-6 w-6" /></Button>
                </header>
                <DoctorBookingSkeleton />
            </div>
        )
    }

    if (!doctor) return null;

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon">
                    <Share className="h-6 w-6" />
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto px-4 space-y-6">
                <div className="relative h-48">
                    <Avatar className="h-32 w-32 absolute bottom-0 left-1/2 -translate-x-1/2 border-4 border-background">
                        <AvatarImage src={doctor.photoURL} alt={doctor.displayName} />
                        <AvatarFallback className="text-3xl">{getInitials(doctor.displayName || '')}</AvatarFallback>
                    </Avatar>
                </div>

                <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                         <Star className="h-5 w-5 text-yellow-400 fill-yellow-400"/>
                         <span className="font-bold text-muted-foreground">{doctor.rating || 4.9}</span>
                    </div>
                    <h1 className="text-2xl font-bold">Dr. {doctor.displayName}</h1>
                    <p className="text-muted-foreground">{doctor.specialty || 'General Physician'}</p>
                </div>
                

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Select Date</CardTitle>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <ChevronLeft className="h-5 w-5 cursor-pointer"/>
                                <span>{format(currentDate, 'MMMM yyyy')}</span>
                                <ChevronRight className="h-5 w-5 cursor-pointer"/>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-between gap-1">
                        {weekDays.map(date => (
                            <button key={date.toString()} onClick={() => setSelectedDate(date)} className={cn(
                                "p-2 border rounded-xl text-center w-full",
                                format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-card hover:bg-accent"
                            )}>
                                <p className="text-xs">{format(date, 'EEE')}</p>
                                <p className="font-bold text-lg">{format(date, 'd')}</p>
                            </button>
                        ))}
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Select Time</CardTitle>
                             <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <ChevronLeft className="h-5 w-5 cursor-pointer"/>
                                <span>{timeSlots.length} Slots</span>
                                <ChevronRight className="h-5 w-5 cursor-pointer"/>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-3">
                        {timeSlots.map(slot => (
                            <Button
                                key={slot}
                                variant={selectedTime === slot ? 'default' : 'secondary'}
                                className="rounded-full"
                                onClick={() => setSelectedTime(slot)}
                            >
                                {slot}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

            </main>
            <footer className="p-4 border-t bg-background">
                 <div className="flex gap-3">
                    <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full">
                        <MessageSquare className="h-6 w-6"/>
                    </Button>
                    <Button className="w-full text-lg h-14 rounded-full" size="lg" onClick={handleBooking} disabled={isBooking}>
                        {isBooking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Book an Appointment
                    </Button>
                </div>
            </footer>
        </div>
    )
}
