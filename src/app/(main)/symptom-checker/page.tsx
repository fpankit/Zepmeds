
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalyze = () => {
    if (!symptoms.trim()) {
      toast({
        variant: 'destructive',
        title: 'Symptoms Required',
        description: 'Please describe your symptoms before analyzing.',
      });
      return;
    }

    if (!user || user.isGuest) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please log in to use the AI Symptom Checker.',
      });
      router.push('/login');
      return;
    }

    setIsLoading(true);
    // Encode the symptoms to safely pass them in the URL
    const encodedSymptoms = encodeURIComponent(symptoms);
    router.push(`/symptom-checker/results?symptoms=${encodedSymptoms}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <BrainCircuit className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold">AI Symptom Checker</CardTitle>
          <CardDescription>Describe your symptoms, and our AI will provide initial guidance. This is not a substitute for professional medical advice.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., 'I have a headache, a sore throat, and a slight fever for the last 2 days...'"
            className="min-h-[150px] text-base"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-lg"
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              'Analyze My Symptoms'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
