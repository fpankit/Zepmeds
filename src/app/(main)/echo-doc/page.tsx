
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Bot } from 'lucide-react';
import { useCalls } from '@/hooks/use-calls';


export default function EchoDocSetupPage() {
    const router = useRouter();
    const { doctors } = useCalls();
    
    const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0].id);
    const [symptoms, setSymptoms] = useState('');

    const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);

    const handleStartConsultation = () => {
        if (selectedDoctor) {
            // Pass data to the call page via query parameters
            // Language is no longer needed
            router.push(`/echo-doc/call?symptoms=${encodeURIComponent(symptoms)}&doctorId=${selectedDoctorId}&doctorName=${encodeURIComponent(selectedDoctor.name)}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <Bot className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl font-bold">Echo Doc AI</CardTitle>
                    <CardDescription>
                        Start a conversation with a friendly AI medical agent who can understand any language.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Choose Your AI Doctor</div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {doctors.map(doctor => (
                                <button key={doctor.id} onClick={() => setSelectedDoctorId(doctor.id)} className={`flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-lg border-2 ${selectedDoctorId === doctor.id ? 'border-primary' : 'border-transparent'}`}>
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={doctor.image} alt={doctor.name} />
                                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-semibold">{doctor.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="symptoms">You can add some details to start, or begin by just saying hello. (Optional)</Label>
                        <Textarea
                            id="symptoms"
                            placeholder="e.g., I have a headache..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={handleStartConsultation} 
                    >
                        Start Consultation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
