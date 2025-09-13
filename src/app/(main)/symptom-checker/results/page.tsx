
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { aiSymptomChecker, AISymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Pill, Apple, ShieldAlert, Dumbbell, Stethoscope, Bot, MessageSquare, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorSuggestionCard } from '@/components/features/doctor-suggestion-card';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User as AuthUser } from '@/context/auth-context';


const offlineGuide: AISymptomCheckerOutput = {
    response: "You appear to be offline. The following is a general first aid guide. For personalized advice, please connect to the internet.",
    medicines: "For common pain or fever, consider Paracetamol. For indigestion, an antacid may help. Always read the label.",
    diet: "Stay hydrated by drinking plenty of water. Eat light, bland foods like toast, rice, or bananas. Avoid spicy or heavy meals.",
    precautions: "Rest as much as possible. Monitor your symptoms. If they worsen or you feel very unwell, seek medical attention.",
    workouts: "Avoid strenuous activity. Gentle stretching is okay if you feel up to it, but prioritize rest.",
    advice: "If your symptoms are severe, include chest pain, difficulty breathing, or high fever, please see a doctor immediately.",
    suggestedSpecialty: "General Physician"
};

function SymptomResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptoms = searchParams.get('symptoms');
  
  const [result, setResult] = useState<AISymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('English');
  const [suggestedDoctors, setSuggestedDoctors] = useState<AuthUser[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
        setIsOffline(true);
    }
  }, []);

  useEffect(() => {
    if (!symptoms) {
      setError('No symptoms provided.');
      setIsLoading(false);
      return;
    }

    const getAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      
      if (isOffline) {
          setResult(offlineGuide);
          setIsLoading(false);
          return;
      }

      try {
        const analysis = await aiSymptomChecker({ symptoms });
        setResult(analysis);
        if(analysis.suggestedSpecialty) {
            fetchDoctors(analysis.suggestedSpecialty);
        }
      } catch (e) {
        console.error(e);
        setError("The AI symptom checker failed to generate a response. This could be due to a temporary issue with the service. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDoctors = async (specialty: string) => {
        try {
            const q = query(collection(db, "doctors"), where("specialty", "==", specialty), limit(3));
            const querySnapshot = await getDocs(q);
            const doctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuthUser));
            setSuggestedDoctors(doctors);
        } catch(e) {
            console.error("Error fetching suggested doctors:", e);
        }
    }

    getAnalysis();
  }, [symptoms, isOffline]);


  const analysisSections = useMemo(() => [
    { title: 'Medicines', icon: Pill, content: result?.medicines, color: 'text-blue-400' },
    { title: 'Diet', icon: Apple, content: result?.diet, color: 'text-green-400' },
    { title: 'Precautions', icon: ShieldAlert, content: result?.precautions, color: 'text-yellow-400' },
    { title: 'Workouts', icon: Dumbbell, content: result?.workouts, color: 'text-orange-400' },
    { title: 'Advice', icon: Stethoscope, content: result?.advice, color: 'text-red-400' },
  ], [result]);

  const renderSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
    </div>
  );
  
  const languageOptions = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Kannada'];

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Analysis Results</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className={isOffline ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-primary/10 border-primary/20'}>
            <CardHeader>
                <CardTitle className='flex items-center gap-3'>
                    {isOffline ? <AlertTriangle className='h-8 w-8 text-yellow-500' /> : <Bot className='h-8 w-8' />}
                    {isOffline ? 'Offline Guide' : 'AI Analysis'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-muted-foreground'>
                   {result?.response || "Based on the symptoms you provided, here is a potential course of action. Please remember, this is not a substitute for professional medical advice."}
                </p>
            </CardContent>
        </Card>


        {isLoading ? (
          renderSkeleton()
        ) : error && !result ? (
          <Card className="text-center">
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p className="text-destructive">{error}</p></CardContent>
          </Card>
        ) : (
          (result) && (
            <div className="space-y-4">
                {isTranslating && <div className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <p>Translating to {targetLang}...</p></div>}
                
                {analysisSections.map(section => (
                    <Card key={section.title}>
                        <CardHeader>
                            <CardTitle className={`flex items-center gap-2 text-lg ${section.color}`}>
                                <section.icon className="h-6 w-6" />
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='whitespace-pre-line'>{section.content}</p>
                        </CardContent>
                    </Card>
                ))}

                 {suggestedDoctors.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Stethoscope className="h-6 w-6" />
                                Doctor Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {suggestedDoctors.map(doctor => (
                                <DoctorSuggestionCard key={doctor.id} doctor={doctor as any} />
                            ))}
                        </CardContent>
                    </Card>
                )}


                <Card className="hover:bg-primary/10 border-primary/20 transition-colors">
                    <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                            <MessageSquare className='h-8 w-8 text-primary' />
                            Have more questions?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-muted-foreground'>
                            Continue the conversation with our medical AI for more detailed information.
                        </p>
                         <Button className="mt-4" onClick={() => router.push(`/echo-doc/call?symptoms=${encodeURIComponent(symptoms || '')}`)} disabled={isOffline}>
                            {isOffline ? 'Connect to Internet to Chat' : 'Chat with AI'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
          )
        )}
      </main>
    </div>
  );
}


export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SymptomResults />
        </Suspense>
    )
}
