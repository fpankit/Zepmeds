
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { aiSymptomChecker, AISymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { translateText } from '@/ai/flows/translate-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Pill, Apple, ShieldAlert, Dumbbell, Stethoscope, Bot, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type TranslatedContent = {
    medicines?: string;
    diet?: string;
    precautions?: string;
    workouts?: string;
    advice?: string;
}

function SymptomResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptoms = searchParams.get('symptoms');
  
  const [result, setResult] = useState<AISymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('English');
  const [translatedResult, setTranslatedResult] = useState<TranslatedContent | null>(null);

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

  const handleTranslate = async (lang: string) => {
    if (!result || lang === 'English') {
        setTargetLang('English');
        setTranslatedResult(null);
        return;
    }
    
    if (lang === targetLang && translatedResult) return;

    setTargetLang(lang);
    setIsTranslating(true);
    
    try {
      const [medicines, diet, precautions, workouts, advice] = await Promise.all([
          translateText({ text: result.medicines, targetLanguage: lang }),
          translateText({ text: result.diet, targetLanguage: lang }),
          translateText({ text: result.precautions, targetLanguage: lang }),
          translateText({ text: result.workouts, targetLanguage: lang }),
          translateText({ text: result.advice, targetLanguage: lang }),
      ]);
      setTranslatedResult({
          medicines: medicines.translatedText,
          diet: diet.translatedText,
          precautions: precautions.translatedText,
          workouts: workouts.translatedText,
          advice: advice.translatedText,
      });
    } catch (e) {
      console.error('Translation error', e);
      setError(`Failed to translate to ${lang}. Please try again.`);
    } finally {
      setIsTranslating(false);
    }
  }

  const analysisSections = useMemo(() => [
    { title: 'Medicines', icon: Pill, content: translatedResult?.medicines || result?.medicines, color: 'text-blue-400' },
    { title: 'Diet', icon: Apple, content: translatedResult?.diet || result?.diet, color: 'text-green-400' },
    { title: 'Precautions', icon: ShieldAlert, content: translatedResult?.precautions || result?.precautions, color: 'text-yellow-400' },
    { title: 'Workouts', icon: Dumbbell, content: translatedResult?.workouts || result?.workouts, color: 'text-orange-400' },
    { title: 'Advice', icon: Stethoscope, content: translatedResult?.advice || result?.advice, color: 'text-red-400' },
  ], [result, translatedResult]);

  const renderSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
    </div>
  );
  
  const languageOptions = ['English', 'Hindi', 'Punjabi'];

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
                 <div className="mt-4 flex gap-2">
                    {languageOptions.map(lang => (
                        <Button
                            key={lang}
                            variant={targetLang === lang ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleTranslate(lang)}
                            disabled={isTranslating}
                        >
                            {isTranslating && targetLang === lang ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {lang}
                        </Button>
                    ))}
                 </div>
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
          (result || translatedResult) && (
            <div className="space-y-4">
                {isTranslating && <div className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <p>Translating...</p></div>}
                
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

                <Card className="hover:bg-primary/10 border-primary/20 transition-colors">
                  <Link href="/echo-doc">
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
                    </CardContent>
                  </Link>
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
