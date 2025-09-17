'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { aiSymptomChecker, AiSymptomCheckerOutput, AiSymptomCheckerInput } from '@/ai/flows/ai-symptom-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertTriangle, Pill, Shield, Utensils, Dumbbell, Stethoscope, Briefcase, BrainCircuit, Sparkles, BookOpenCheck, Zap } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';


const loadingMessages = [
    { text: "AI is thinking...", icon: BrainCircuit },
    { text: "Wait, AI can't think... that would be dangerous!", icon: AlertTriangle },
    { text: "Just cross-referencing symptoms with medical data...", icon: BookOpenCheck },
    { text: "Finalizing your preliminary analysis...", icon: Sparkles },
];

function EngagingLoader() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2500); // Change message every 2.5 seconds

        return () => clearInterval(interval);
    }, []);
    
    const { text, icon: Icon } = loadingMessages[index];

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 bg-card/50 rounded-xl">
             <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center gap-4"
                >
                    <Icon className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-lg font-semibold text-muted-foreground">{text}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}


function SymptomCheckerResultsContent() {
  const router = useRouter();
  const [inputData, setInputData] = useState<AiSymptomCheckerInput | null>(null);
  const [result, setResult] = useState<AiSymptomCheckerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator.onLine !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const storedData = sessionStorage.getItem('symptomCheckerData');
    if (!storedData) {
      setError('No symptom data found. Please go back and describe your symptoms.');
      setIsLoading(false);
      return;
    }
    const parsedData: {symptoms: string; photoDataUri: string | null; targetLanguage: string;} = JSON.parse(storedData);

    if (!user || user.isGuest) {
      toast({ variant: 'destructive', title: 'Login Required' });
      router.replace('/login');
      return;
    }

    if (isOffline) {
      setError('You are offline. Please check your internet connection and try again.');
      setIsLoading(false);
      return;
    }
    
    const requestPayload: AiSymptomCheckerInput = {
        symptoms: parsedData.symptoms,
        targetLanguage: parsedData.targetLanguage || 'English',
        photoDataUri: parsedData.photoDataUri || undefined
    };


    setInputData(requestPayload);
    setIsLoading(true);

    aiSymptomChecker(requestPayload)
      .then((res) => {
        setResult(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        const errorMessage = err.message || 'An error occurred while analyzing your symptoms. Please try again later.';
        setError(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, router, toast, isOffline]);

  const ResultCard = ({ title, icon, items }: { title: string, icon: React.ReactNode, items: string[] }) => (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </CardContent>
    </Card>
  );

  const getConfidenceColor = (confidence: "High" | "Medium" | "Low") => {
    switch (confidence) {
        case "High": return "bg-red-500/80";
        case "Medium": return "bg-yellow-500/80";
        case "Low": return "bg-green-500/80";
        default: return "bg-gray-500/80";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-lg border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Symptom Analysis</h1>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {isLoading && <EngagingLoader />}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.back()}>Go back and try again.</Button>
            </AlertDescription>
          </Alert>
        )}

        {result && inputData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold italic">"{inputData.symptoms}"</p>
                {inputData.photoDataUri && (
                    <Image src={inputData.photoDataUri} alt="Symptom image" width={500} height={300} className="rounded-lg object-cover w-full aspect-video" />
                )}
              </CardContent>
            </Card>
            
            <Alert>
              <Stethoscope className="h-4 w-4" />
              <AlertTitle>Doctor's Advisory</AlertTitle>
              <AlertDescription>{result.doctorAdvisory}</AlertDescription>
            </Alert>
            
            {result.differentialDiagnosis && result.differentialDiagnosis.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <BrainCircuit className="text-primary"/> Differential Diagnosis
                        </CardTitle>
                        <CardDescription>
                            Here are the potential conditions based on your symptoms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {result.differentialDiagnosis.map((diag, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-card/50">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">{diag.condition}</h3>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full text-white ${getConfidenceColor(diag.confidence)}`}>
                                        {diag.confidence} Confidence
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-muted-foreground">
                                    <Sparkles className="h-4 w-4 mt-1 text-yellow-400 flex-shrink-0" />
                                    <p className="text-sm"><span className="font-semibold text-foreground/90">AI Reasoning:</span> {diag.reasoning}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {result.recommendedSpecialist && (
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Consult a Specialist</h3>
                    <p className="text-muted-foreground">The AI recommends seeing a <span className="font-semibold text-primary">{result.recommendedSpecialist}</span>.</p>
                  </div>
                  <Button onClick={() => router.push(`/doctor?specialty=${result.recommendedSpecialist}`)}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Find a Doctor
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultCard title="Medicine Suggestions" icon={<Pill className="text-blue-500"/>} items={result.potentialMedicines} />
              <ResultCard title="Precautions" icon={<Shield className="text-yellow-500"/>} items={result.precautions} />
              <ResultCard title="Dietary Advice" icon={<Utensils className="text-green-500"/>} items={result.diet} />
              <ResultCard title="Exercise / Rest" icon={<Dumbbell className="text-orange-500"/>} items={result.exercise} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


export default function SymptomCheckerResultsPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading results...</div>}>
            <SymptomCheckerResultsContent />
        </Suspense>
    )
}
