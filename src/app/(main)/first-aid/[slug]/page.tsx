
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { firstAidCategories, FirstAidTopic } from '@/lib/first-aid-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Volume2, Video, Languages, AlertTriangle } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { translateText } from '@/ai/flows/translate-text';
import { useToast } from '@/hooks/use-toast';

export default function FirstAidDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<FirstAidTopic | null>(null);
  const [translatedSteps, setTranslatedSteps] = useState<string[] | null>(null);
  const [targetLang, setTargetLang] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const currentTopic = firstAidCategories.find((t) => t.slug === slug);
    if (currentTopic) {
      setTopic(currentTopic);
    } else {
      router.push('/first-aid'); // Redirect if topic not found
    }
  }, [slug, router]);

  const handlePlayAudio = async () => {
    if (!topic || isSpeaking) return;

    setIsSpeaking(true);
    const textToRead = (translatedSteps || topic.steps).join('. ');
    try {
      const { audioDataUri, error } = await textToSpeech({ text: textToRead });
      if (error || !audioDataUri) {
        throw new Error(error || 'Failed to generate audio.');
      }
      const audio = new Audio(audioDataUri);
      audio.play();
      audio.onended = () => setIsSpeaking(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Audio Error', description: 'Could not play the instructions.' });
      setIsSpeaking(false);
    }
  };
  
  const handleTranslate = async (lang: string) => {
    if (!topic || lang === 'English') {
      setTargetLang('English');
      setTranslatedSteps(null);
      return;
    }

    setTargetLang(lang);
    setIsTranslating(true);
    try {
        const translated = await Promise.all(
            topic.steps.map(step => translateText({ text: step, targetLanguage: lang }))
        );
        setTranslatedSteps(translated.map(t => t.translatedText));
    } catch (e) {
        toast({ variant: 'destructive', title: 'Translation Error', description: 'Could not translate the guide.' });
        setTranslatedSteps(null);
    } finally {
        setIsTranslating(false);
    }
  }


  if (!topic) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const languageOptions = ['English', 'Hindi', 'Punjabi'];

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
                <CardTitle>Step-by-Step Guide</CardTitle>
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
                    <Button variant="outline" size="icon" onClick={handlePlayAudio} disabled={isSpeaking}>
                        {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isTranslating ? (
                    <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : (
                    <ol className="space-y-4">
                        {(translatedSteps || topic.steps).map((step, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                            {index + 1}
                            </div>
                            <p className="flex-1 pt-1">{step}</p>
                        </li>
                        ))}
                    </ol>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
