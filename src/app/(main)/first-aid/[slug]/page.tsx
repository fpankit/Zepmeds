'use client';

import { useParams, useRouter } from 'next/navigation';
import { firstAidCategories, FirstAidTopic } from '@/lib/first-aid-data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare, Sparkles, Languages, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { simplifyFirstAidFlow } from '@/ai/flows/simplify-first-aid-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
];

export default function FirstAidDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const { toast } = useToast();

  const [topic, setTopic] = useState<FirstAidTopic | undefined>(undefined);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [simplifiedSteps, setSimplifiedSteps] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      const foundTopic = firstAidCategories.find((t) => t.slug === slug);
      setTopic(foundTopic);
    }
  }, [slug]);
  
  const handleSimplify = async () => {
      if (!topic) return;
      setIsLoading(true);
      setSimplifiedSteps(null);
      
      try {
        const result = await simplifyFirstAidFlow({
            topic: topic.title,
            steps: topic.steps,
            targetLanguage: targetLanguage
        });
        setSimplifiedSteps(result.simplifiedExplanation);
      } catch (error) {
        console.error("Failed to get simplified steps:", error);
        toast({
            variant: "destructive",
            title: "AI Simplification Failed",
            description: "Could not generate the simplified guide. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
  }

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
                    
                    <Card className="bg-card/30">
                        <CardHeader>
                             <CardTitle className="text-lg">What to do:</CardTitle>
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
                    
                    <Card className="bg-gradient-to-br from-primary/10 to-background">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sparkles className="text-yellow-400"/> AI Explanation
                            </CardTitle>
                             <CardDescription>
                                Let AI simplify these steps for you in your chosen language.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
                                    <Languages className="h-4 w-4"/> Select Language
                                </div>
                                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
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

                             <Button onClick={handleSimplify} disabled={isLoading} className="w-full bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50">
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                {isLoading ? 'Generating...' : 'Simplify with AI'}
                            </Button>

                            {simplifiedSteps && (
                                <Alert className="bg-background/50">
                                    <AlertTitle className="font-bold">Simplified Steps</AlertTitle>
                                    <AlertDescription className="whitespace-pre-line">
                                        {simplifiedSteps}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
