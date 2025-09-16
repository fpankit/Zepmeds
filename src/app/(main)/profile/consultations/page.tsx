
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageSquare, FilePlus2, AlertTriangle, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Consultation {
    id: string;
    patientId: string;
    patientName: string;
    createdAt: Timestamp;
    status: 'ringing' | 'answered' | 'declined' | 'completed';
}

const ConsultationSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
    </div>
);


export default function ConsultationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || !user.isDoctor) {
          setIsLoading(false);
          return;
        }

        const q = query(
            collection(db, 'video_calls'),
            where('doctorId', '==', user.id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedConsultations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Consultation));
            setConsultations(fetchedConsultations);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching consultations:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);
    
    const handleCreateReport = (consultation: Consultation) => {
        const params = new URLSearchParams({
            patientId: consultation.patientId,
            patientName: consultation.patientName,
        });
        router.push(`/profile/create-report?${params.toString()}`);
    }

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'answered':
            case 'completed':
                return <Badge variant="default" className="bg-green-500">Completed</Badge>;
            case 'declined':
                return <Badge variant="destructive">Declined</Badge>;
            case 'ringing':
                return <Badge variant="secondary" className="bg-yellow-500">Missed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }


    if(authLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user?.isDoctor) {
        return (
            <div className="flex flex-col h-screen bg-background">
              <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-6 w-6" /></Button>
                <h1 className="text-xl font-bold">My Consultations</h1>
                <div className="w-8" />
              </header>
              <main className="flex-1 flex items-center justify-center p-4">
                  <Card className="text-center p-10">
                      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                      <h3 className="text-xl font-semibold mt-4">Access Denied</h3>
                      <p className="text-muted-foreground">This page is only available for doctors.</p>
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
                <h1 className="text-xl font-bold">My Consultations</h1>
                <div className="w-8" />
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <ConsultationSkeleton />
                ) : consultations.length === 0 ? (
                    <Card className="text-center p-10 mt-6">
                        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No Consultations Found</h3>
                        <p className="text-muted-foreground">You have not had any video consultations yet.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {consultations.map(consultation => (
                            <Card key={consultation.id}>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-bold text-lg">{consultation.patientName}</p>
                                            </div>
                                             <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Calendar className="h-4 w-4" />
                                                <p>{format(consultation.createdAt.toDate(), 'PPP, p')}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(consultation.status)}
                                    </div>
                                    <Button className="w-full" onClick={() => handleCreateReport(consultation)}>
                                        <FilePlus2 className="mr-2 h-4 w-4"/>
                                        Create Report
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
