
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { aiSymptomChecker, AISymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Pill, Apple, ShieldAlert, Dumbbell, Stethoscope, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SymptomResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptoms = searchParams.get('symptoms');
  
  const [result, setResult] = useState<AISymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symptoms) {
      setError('No symptoms provided.');
      setIsLoading(false);
      return;
    }

    const getAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const analysis = await aiSymptomChecker({ symptoms });
        setResult(analysis);
      } catch (e) {
        console.error(e);
        setError('Failed to get analysis. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    getAnalysis();
  }, [symptoms]);

  const renderSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
    </div>
  )

  const analysisSections = [
    { title: 'Medicines', icon: Pill, content: result?.medicines, color: 'text-blue-400' },
    { title: 'Diet', icon: Apple, content: result?.diet, color: 'text-green-400' },
    { title: 'Precautions', icon: ShieldAlert, content: result?.precautions, color: 'text-yellow-400' },
    { title: 'Workouts', icon: Dumbbell, content: result?.workouts, color: 'text-orange-400' },
    { title: 'Advice', icon: Stethoscope, content: result?.advice, color: 'text-red-400' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Analysis Results</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className='bg-primary/10 border-primary/20'>
            <CardHeader>
                <CardTitle className='flex items-center gap-3'>
                    <Bot className='h-8 w-8' />
                    AI Analysis
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-muted-foreground'>
                   Based on the symptoms you provided, here is a potential course of action. Please remember, this is not a substitute for professional medical advice.
                </p>
            </CardContent>
        </Card>


        {isLoading ? (
          renderSkeleton()
        ) : error ? (
          <Card className="text-center">
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p className="text-destructive">{error}</p></CardContent>
          </Card>
        ) : (
          result && (
            <div className="space-y-4">
              {analysisSections.map(section => (
                 <Card key={section.title}>
                    <CardHeader>
                        <CardTitle className={`flex items-center gap-2 text-lg ${section.color}`}>
                            <section.icon className="h-6 w-6" />
                            {section.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{section.content}</p>
                    </CardContent>
                 </Card>
              ))}
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
