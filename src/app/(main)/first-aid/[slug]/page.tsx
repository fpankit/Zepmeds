'use client';

import { useParams, useRouter } from 'next/navigation';
import { firstAidCategories, FirstAidTopic } from '@/lib/first-aid-data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Languages, Loader2, ThumbsUp, ThumbsDown, CheckSquare } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { simplifyFirstAidFlow } from '@/ai/flows/simplify-first-aid-flow';
import type { SimplifyFirstAidOutput } from '@/ai/flows/simplify-first-aid-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
];

const SimplifiedGuideSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    </div>
);


export default function FirstAidDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const { toast } = useToast();

  const [topic, setTopic] = useState<FirstAidTopic | undefined>(undefined);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [simplifiedGuide, setSimplifiedGuide] = useState<SimplifyFirstAidOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      const foundTopic = firstAidCategories.find((t) => t.slug === slug);
      setTopic(foundTopic);
    }
  }, [slug]);
  
  const generateSimplifiedGuide = useCallback(async () => {
      if (!topic) return;
      setIsLoading(true);
      setSimplifiedGuide(null);
      
      try {
        const result = await simplifyFirstAidFlow({
            topic: topic.title,
            steps: topic.steps,
            targetLanguage: targetLanguage
        });
        setSimplifiedGuide(result);
      } catch (error) {
        console.error("Failed to get simplified steps:", error);
        toast({
            variant: "destructive",
            title: "AI Generation Failed",
            description: "Could not generate the simplified guide. Please check your connection."
        });
      } finally {
        setIsLoading(false);
      }
  }, [topic, targetLanguage, toast]);

  useEffect(() => {
      generateSimplifiedGuide();
  }, [generateSimplifiedGuide]);


  if (!topic) {
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                </Button>
            </header>
            <div className="flex-1 flex items-center justify-center">
                <p>Emergency guide not found.</p>
            </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold truncate">{topic.title}</h1>
            <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                            <topic.icon className="h-8 w-8 text-red-500" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{topic.title}</CardTitle>
                            <CardDescription>{topic.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {topic.videoUrl && (
                        <div className="aspect-video">
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={topic.videoUrl}
                            title={`First aid video for ${topic.title}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        </div>
                    )}
                    
                    <Card className="bg-gradient-to-br from-primary/10 to-background">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sparkles className="text-yellow-400"/> AI Simplified Guide
                            </CardTitle>
                             <CardDescription>
                                Simplified steps, automatically generated by AI in your preferred language.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
                                    <Languages className="h-4 w-4"/> Language
                                </div>
                                <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>

                            {isLoading && <SimplifiedGuideSkeleton />}

                            {!isLoading && simplifiedGuide && (
                                <Alert className="bg-background/50">
                                    <AlertTitle className="font-bold">What To Do Immediately</AlertTitle>
                                    <AlertDescription className="whitespace-pre-line">
                                        {simplifiedGuide.whatToDo}
                                    </AlertDescription>
                                    
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2 text-green-400"><ThumbsUp/> The Do's</h4>
                                            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                                {simplifiedGuide.theDos.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>
                                         <div>
                                            <h4 className="font-bold flex items-center gap-2 text-red-400"><ThumbsDown/> The Don'ts</h4>
                                            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                                 {simplifiedGuide.theDonts.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>
                                    </div>

                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                     <Card className="bg-card/30">
                        <CardHeader>
                             <CardTitle className="text-lg">Official Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topic.steps.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckSquare className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                        <p>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
