
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Bot } from 'lucide-react';


export default function EchoDocSetupPage() {
    const router = useRouter();
    const [symptoms, setSymptoms] = useState('');

    const handleStartConsultation = () => {
        // Pass data to the call page via query parameters
        // Doctor ID is no longer needed.
        router.push(`/echo-doc/call?symptoms=${encodeURIComponent(symptoms)}`);
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
