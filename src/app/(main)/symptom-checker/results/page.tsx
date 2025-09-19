
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { aiSymptomChecker, AiSymptomCheckerOutput, AiSymptomCheckerInput } from '@/ai/flows/ai-symptom-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle, Pill, Shield, Utensils, Dumbbell, Stethoscope, Briefcase, BrainCircuit, Sparkles, BookOpenCheck, WifiOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { findOfflineMatch } from '@/lib/offline-symptom-data';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface HistoryItem {
    id: string;
    input: AiSymptomCheckerInput;
    result: AiSymptomCheckerOutput;
    timestamp: string;
}

const loadingMessages = [
    { text: "AI is thinking...", icon: BrainCircuit },
    { text: "Cross-referencing symptoms with medical data...", icon: BookOpenCheck },
    { text: "Analyzing symptom image with Vision AI...", icon: Loader2 },
    { text: "Finalizing your preliminary analysis...", icon: Sparkles },
];

function EngagingLoader({ hasImage }: { hasImage: boolean }) {
    const [index, setIndex] = useState(0);

    const relevantMessages = useMemo(() => 
        loadingMessages.filter(m => hasImage || m.icon !== Loader2), 
    [hasImage]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % relevantMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [relevantMessages.length]);
    
    const currentMessage = relevantMessages[index];
    const Icon = currentMessage.icon;

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
                    <Icon className={`h-12 w-12 text-primary ${Icon === Loader2 ? 'animate-spin' : 'animate-pulse'}`} />
                    <p className="text-lg font-semibold text-muted-foreground">{currentMessage.text}</p>
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
  
  const isOnline = useMemo(() => !isOffline, [isOffline]);

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

  const saveToHistory = async (input: AiSymptomCheckerInput, result: AiSymptomCheckerOutput) => {
    if (!user || user.isGuest) return;

    const newHistoryItem: HistoryItem = {
        id: uuidv4(),
        input,
        result,
        timestamp: new Date().toISOString(),
    };
    
    // Save to local storage for offline access
    try {
        const existingHistoryString = localStorage.getItem('symptomCheckerHistory');
        const existingHistory: HistoryItem[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
        const updatedHistory = [newHistoryItem, ...existingHistory].slice(0, 10); // Keep last 10
        localStorage.setItem('symptomCheckerHistory', JSON.stringify(updatedHistory));
    } catch (e) {
        console.error("Failed to save to local history:", e);
    }

    // Save to Firestore for backend persistence
    try {
      await addDoc(collection(db, "symptom_analysis"), {
          userId: user.id,
          ...newHistoryItem,
          createdAt: serverTimestamp() // Use server-side timestamp for consistency
      });
    } catch (e) {
        console.error("Failed to save analysis to Firestore:", e);
        // This is not a critical error for the user, so we don't show a toast.
    }
  };
  
  useEffect(() => {
    setError(null);
    const historyItemData = sessionStorage.getItem('symptomCheckerHistoryItem');
    const symptomData = sessionStorage.getItem('symptomCheckerData');

    const performAnalysis = async (dataToProcess: any) => {
        setIsLoading(true);
        const displayInput: AiSymptomCheckerInput = {
            symptoms: dataToProcess.symptoms,
            targetLanguage: dataToProcess.targetLanguage || 'English',
            photoDataUri: dataToProcess.mediaDataUri || undefined,
            age: dataToProcess.age,
            duration: dataToProcess.duration,
            pastMedications: dataToProcess.pastMedications,
            allergies: dataToProcess.allergies,
        };
        setInputData(displayInput);

        if (!user || user.isGuest) {
            toast({ variant: 'destructive', title: 'Login Required' });
            router.replace('/login');
            return;
        }
        
        const requestPayload: AiSymptomCheckerInput = {
            symptoms: dataToProcess.symptoms,
            targetLanguage: dataToProcess.targetLanguage || 'English',
            photoDataUri: dataToProcess.mediaDataUri,
            age: dataToProcess.age,
            duration: dataToProcess.duration,
            pastMedications: dataToProcess.pastMedications,
            allergies: dataToProcess.allergies,
        };

        if (isOnline) {
            try {
                const aiResult = await aiSymptomChecker(requestPayload);
                setResult(aiResult);
                await saveToHistory(displayInput, aiResult); // Save on success
            } catch (err: any) {
                if (err.message === 'AI_MODEL_BUSY') {
                    const offlineResult = findOfflineMatch(dataToProcess.symptoms, dataToProcess.targetLanguage);
                    if (offlineResult) {
                        setResult(offlineResult);
                        await saveToHistory(displayInput, offlineResult); // Save on success
                        toast({
                            variant: 'default',
                            title: 'AI is Busy',
                            description: 'Displaying general advice. Please try again later for a full analysis.'
                        });
                    } else {
                        setError('The AI model is busy, and no general advice matched your symptoms. Please try again.');
                    }
                } else {
                    console.error("An unexpected error occurred during AI analysis:", err);
                    setError(err.message || 'An unexpected error occurred. Please try again later.');
                }
            }
        } else {
            const offlineResult = findOfflineMatch(dataToProcess.symptoms, dataToProcess.targetLanguage);
            if (offlineResult) {
                setResult(offlineResult);
                await saveToHistory(displayInput, offlineResult); // Save on success
            } else {
                setError("You are offline and no direct match was found for your symptoms. Please connect to the internet for a full AI analysis.");
            }
        }
        setIsLoading(false);
        sessionStorage.removeItem('symptomCheckerData');
    };

    if (historyItemData) {
        try {
            const parsedData: HistoryItem = JSON.parse(historyItemData);
            setInputData(parsedData.input);
            setResult(parsedData.result);
            setIsLoading(false);
            sessionStorage.removeItem('symptomCheckerHistoryItem');
        } catch(e) {
             console.error("Failed to parse history item", e);
             setError("Could not load history item.");
             setIsLoading(false);
             sessionStorage.removeItem('symptomCheckerHistoryItem');
        }
    } else if (symptomData) {
        try {
            const parsedData = JSON.parse(symptomData);
            performAnalysis(parsedData);
        } catch(e) {
            setError("Could not read symptom data.");
            setIsLoading(false);
        }
    } else {
        setError('No symptom data found. Please go back and describe your symptoms.');
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {isLoading && <EngagingLoader hasImage={!!inputData?.photoDataUri} />}

        {error && !isLoading && (
          <Alert variant="destructive">
             {isOffline ? <WifiOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{isOffline ? "You are Offline" : "Analysis Failed"}</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.back()}>Go back and try again.</Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && result && inputData && (
          <div className="space-y-6">
            {!isOnline && (
                 <Alert variant="default" className="bg-blue-500/10 border-blue-500/50">
                    <WifiOff className="h-4 w-4 text-blue-400" />
                    <AlertTitle className="text-blue-300">Displaying Offline Results</AlertTitle>
                    <AlertDescription className="text-blue-400/80">
                        This is general advice. For a detailed AI analysis, please connect to the internet.
                    </AlertDescription>
                </Alert>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="text-sm">
                    <p><strong className="text-muted-foreground">Age:</strong> {inputData.age || 'N/A'}</p>
                    <p><strong className="text-muted-foreground">Duration:</strong> {inputData.duration || 'N/A'}</p>
                    <p><strong className="text-muted-foreground">Medications:</strong> {inputData.pastMedications || 'None'}</p>
                    <p><strong className="text-muted-foreground">Allergies:</strong> {inputData.allergies || 'None'}</p>
                </div>
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
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SymptomCheckerResultsContent />
        </Suspense>
    )
}
