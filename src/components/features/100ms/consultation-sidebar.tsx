
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Heart, AlertTriangle, FileText, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { User as AuthUser, useAuth } from '@/context/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsultationSidebarProps {
    patientId: string;
    patientName: string;
}

export function ConsultationSidebar({ patientId, patientName }: ConsultationSidebarProps) {
    const { user: doctorUser } = useAuth();
    const { toast } = useToast();
    const [patientData, setPatientData] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            chiefComplaint: '',
            doctorNotes: ''
        }
    });
    
    useEffect(() => {
        const fetchPatientData = async () => {
            if (!patientId) return;
            setIsLoading(true);
            try {
                const patientDocRef = doc(db, 'users', patientId);
                const patientDocSnap = await getDoc(patientDocRef);
                if (patientDocSnap.exists()) {
                    setPatientData(patientDocSnap.data() as AuthUser);
                }
            } catch (error) {
                console.error("Failed to fetch patient data:", error);
                toast({ variant: "destructive", title: "Could not load patient details." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId, toast]);

    const onSaveReport = async (data: { chiefComplaint: string; doctorNotes: string }) => {
        if (!doctorUser || !patientData) {
            toast({ variant: 'destructive', title: 'User data missing.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'diagnostic_reports'), {
                patientId: patientData.id,
                patientName: `${patientData.firstName} ${patientData.lastName}`,
                doctorId: doctorUser.id,
                doctorName: `${doctorUser.firstName} ${doctorUser.lastName}`,
                doctorSpecialty: doctorUser.specialty || 'General Physician',
                reportDate: serverTimestamp(),
                chiefComplaint: data.chiefComplaint,
                diagnosis: 'Pending full report', // Placeholder diagnosis
                notes: data.doctorNotes,
                medications: [],
                tests: [],
            });

            toast({
                title: 'Report Saved',
                description: `Notes for ${patientData.firstName} have been saved.`,
            });
            reset();
        } catch (error) {
            console.error("Failed to save report:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save the report." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="p-4 flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><User /> Patient Details</h3>
                
                <div className="text-sm space-y-2 rounded-md border p-3 bg-card">
                    <p><strong>Name:</strong> {patientName}</p>
                    <p><strong>Age:</strong> {patientData?.age || 'N/A'}</p>
                    <p><strong>Gender:</strong> {'N/A'}</p>
                    <div className="flex items-start">
                        <strong className="mr-1">Allergies:</strong>
                        <p className="text-red-400">{'None reported'}</p>
                    </div>
                </div>

                <Separator />

                <form onSubmit={handleSubmit(onSaveReport)} className="space-y-4">
                    <div>
                        <Label htmlFor="chiefComplaint" className="font-semibold flex items-center gap-2 mb-1"><Heart /> Chief Complaint</Label>
                        <Textarea
                            id="chiefComplaint"
                            placeholder="Patient's primary reason for consultation..."
                            rows={4}
                            {...register('chiefComplaint')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="doctorNotes" className="font-semibold flex items-center gap-2 mb-1"><FileText /> Doctor's Notes</Label>
                        <Textarea
                            id="doctorNotes"
                            placeholder="Observations, differential diagnosis, etc."
                            rows={8}
                             {...register('doctorNotes')}
                        />
                    </div>
                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        {isSubmitting ? 'Saving...' : 'Save Report'}
                    </Button>
                </form>
            </div>
        </ScrollArea>
    );
}
