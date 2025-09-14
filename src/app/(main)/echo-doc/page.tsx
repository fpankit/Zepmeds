
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Languages, ArrowRight, Bot } from 'lucide-react';
import { useCalls } from '@/hooks/use-calls';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Marathi', label: 'Marathi (मराठी)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
];

export default function EchoDocSetupPage() {
    const router = useRouter();
    const { doctors } = useCalls();
    
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0].value);
    const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0].id);
    const [symptoms, setSymptoms] = useState('');

    const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);

    const handleStartConsultation = () => {
        if (symptoms.trim() && selectedDoctor) {
            // Pass data to the call page via query parameters
            router.push(`/echo-doc/call?symptoms=${encodeURIComponent(symptoms)}&language=${encodeURIComponent(selectedLanguage)}&doctorId=${selectedDoctorId}&doctorName=${encodeURIComponent(selectedDoctor.name)}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <Bot className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl font-bold">Echo Doc AI</CardTitle>
                    <CardDescription>
                        Start a conversation with a friendly AI medical agent in your preferred language.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="language-select" className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            Choose Your Language
                        </Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger id="language-select">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value}>
                                        {lang.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Choose Your AI Doctor</Label>
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
                        <Label htmlFor="symptoms">Add Symptoms or Any Other Details</Label>
                        <Textarea
                            id="symptoms"
                            placeholder="Add detail here..."
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
                        disabled={!symptoms.trim()}
                    >
                        Start Consultation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
