
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { firstAidCategories, FirstAidTopic } from '@/lib/first-aid-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Video, Languages, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import { translateText } from '@/ai/flows/translate-text';
import { generateFirstAidAdvice, GenerateFirstAidAdviceOutput } from '@/ai/flows/generate-first-aid-advice';
import { useToast } from '@/hooks/use-toast';

type TranslatedContent = {
    procedure: string[];
    whatToAvoid?: string[];
}

export default function FirstAidDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<FirstAidTopic | null>(null);
  const [aiAdvice, setAiAdvice] = useState<GenerateFirstAidAdviceOutput | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [aiError, setAiError] = useState(false);

  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [targetLang, setTargetLang] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const currentTopic = firstAidCategories.find((t) => t.slug === slug);
    if (currentTopic) {
      setTopic(currentTopic);
      // Fetch AI advice when topic is set
      generateFirstAidAdvice({ topic: currentTopic.title })
        .then(advice => {
          // The AI flow now returns an empty response on failure, so we check the content length
          if (advice && advice.procedure.length > 0) {
              setAiAdvice(advice);
              setAiError(false);
          } else {
              setAiError(true);
              toast({
                variant: 'default',
                className: 'bg-blue-500/20 border-blue-500 text-white',
                title: 'Offline Mode',
                description: 'Could not connect to AI. Showing offline guide.',
              });
          }
        })
        .catch(error => {
          console.error("AI advice generation failed:", error);
          setAiError(true);
          toast({
            variant: 'destructive',
            title: 'AI Failed',
            description: 'Could not load AI guide. Showing offline version.',
          });
        })
        .finally(() => {
          setIsLoadingAi(false);
        });
    } else {
      router.push('/first-aid'); // Redirect if topic not found
    }
  }, [slug, router, toast]);

  const handleTranslate = async (lang: string) => {
    setTargetLang(lang);
    if (lang === 'English') {
      setTranslatedContent(null);
      return;
    }

    let procedureToTranslate: string[] = [];
    let avoidToTranslate: string[] = [];

    // Decide what to translate based on available data
    if (aiAdvice && !aiError) {
        procedureToTranslate = aiAdvice.procedure;
        avoidToTranslate = aiAdvice.whatToAvoid;
    } else if(topic) {
        procedureToTranslate = topic.steps;
        // Offline data might not have 'what to avoid'
    } else {
        return; // Nothing to translate
    }

    setIsTranslating(true);
    try {
      // Join array into a single string with a unique separator
      const procedureText = procedureToTranslate.join('\n---\n');
      const avoidText = avoidToTranslate.join('\n---\n');
      
      const [translatedProcedureResult, translatedAvoidResult] = await Promise.all([
          procedureText ? translateText({ text: procedureText, targetLanguage: lang }) : Promise.resolve({ translatedText: '' }),
          avoidText ? translateText({ text: avoidText, targetLanguage: lang }) : Promise.resolve({ translatedText: '' })
      ]);

      setTranslatedContent({
        procedure: translatedProcedureResult.translatedText.split('\n---\n'),
        whatToAvoid: translatedAvoidResult.translatedText ? translatedAvoidResult.translatedText.split('\n---\n') : [],
      });
    } catch (e) {
      console.error("Translation Error: ", e);
      toast({ variant: 'destructive', title: 'Translation Error', description: 'Could not translate the guide.' });
      setTranslatedContent(null);
    } finally {
      setIsTranslating(false);
    }
  };


  if (!topic) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const renderStepList = (steps: string[], isAvoidList = false) => (
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-4">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg ${isAvoidList ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
              {isAvoidList ? <XCircle className="h-5 w-5"/> : index + 1}
            </div>
            <p className="flex-1 pt-1">{step}</p>
          </li>
        ))}
      </ol>
  );

  const languageOptions = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Kannada'];

  // Determine what content to display
  const displayProcedure = translatedContent?.procedure || (aiAdvice && !aiError ? aiAdvice.procedure : topic.steps);
  const displayAvoid = translatedContent?.whatToAvoid || (aiAdvice && !aiError ? aiAdvice.whatToAvoid : []);
  const useAIGuide = !aiError && !!aiAdvice && aiAdvice.procedure.length > 0;

  return (
    <div className="flex flex-col h-screen">
       <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">{topic.title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="p-4 flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0"/>
                <p className="text-sm text-red-300">This information is for educational purposes only. Always call emergency services in a real emergency.</p>
            </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Video Guide</CardTitle>
          </CardHeader>
          <CardContent>
            {topic.videoUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe 
                        src={topic.videoUrl}
                        title={topic.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            ) : (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{useAIGuide ? 'AI First Aid Guide' : 'First Aid Guide (Offline)'}</CardTitle>
                 <div className="flex items-center gap-2">
                     <Select onValueChange={handleTranslate} defaultValue="English" disabled={isTranslating}>
                        <SelectTrigger className="w-[120px]">
                            <Languages className="h-4 w-4 mr-1" /> <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                             {languageOptions.map(lang => (
                                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingAi || isTranslating ? (
                    <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2"> {isTranslating ? 'Translating...' : 'Contacting AI expert...'}</span></div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-400"><ShieldCheck className="h-6 w-6"/> Correct Procedure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {renderStepList(displayProcedure)}
                            </CardContent>
                        </div>
                        {displayAvoid.length > 0 && (
                            <div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-400"><XCircle className="h-6 w-6"/> What to Avoid</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderStepList(displayAvoid, true)}
                                </CardContent>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
