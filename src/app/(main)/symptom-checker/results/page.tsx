
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { aiSymptomChecker, AiSymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Pill, Shield, Utensils, Dumbbell, Stethoscope } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

function ResultsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

function SymptomCheckerResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptoms = searchParams.get('symptoms');
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

    // Set initial status
    if (typeof navigator.onLine !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!symptoms) {
      setError('No symptoms were provided.');
      setIsLoading(false);
      return;
    }

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

    setIsLoading(true);
    aiSymptomChecker({ symptoms: decodeURIComponent(symptoms) })
      .then((res) => {
        setResult(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!navigator.onLine) {
            setError('You seem to be offline. Please check your internet connection.');
        } else {
            setError('An error occurred while analyzing your symptoms. The AI model may be busy. Please try again later.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [symptoms, user, router, toast, isOffline]);

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-lg border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Symptom Analysis</h1>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {isLoading && <ResultsLoadingSkeleton />}

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

        {result && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground">Your symptoms:</p>
              <p className="font-semibold italic">"{decodeURIComponent(symptoms || '')}"</p>
            </div>
            
            <Alert>
              <Stethoscope className="h-4 w-4" />
              <AlertTitle>Doctor's Advisory</AlertTitle>
              <AlertDescription>{result.doctorAdvisory}</AlertDescription>
            </Alert>
            
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
