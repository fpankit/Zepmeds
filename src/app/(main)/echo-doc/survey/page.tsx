
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';

const surveySchema = z.object({
  symptoms: z.string().min(10, { message: 'Please describe your symptoms in at least 10 characters.' }),
  history: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function EchoDocSurveyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      symptoms: '',
      history: '',
      allergies: '',
      medications: '',
    },
  });

  const onSubmit = async (data: SurveyFormValues) => {
    setIsSubmitting(true);
    console.log('Survey Data:', data);
    
    // Here you would typically save the survey data to your backend
    // and use it to get AI-powered doctor recommendations.
    // For now, we will simulate a delay and then navigate to the doctors page.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    router.push('/doctor'); 
  };

  return (
    <>
       <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-lg border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">New Consultation</h1>
          <div className="w-8"></div>
      </header>
      <div className="container mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <FileText />
                Medical Survey
            </CardTitle>
            <CardDescription>
              Please provide some details to help us find the right doctor for you. This information will be shared with your chosen specialist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are your current symptoms?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., I have a persistent cough, fever, and headache..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have any relevant medical history?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Diagnosed with asthma 5 years ago, high blood pressure..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">Please mention any chronic illnesses, past surgeries, or significant medical events.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have any known allergies?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Allergic to penicillin, dust mites..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Are you currently taking any medications?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Metformin 500mg twice daily..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">Include any over-the-counter drugs, supplements, or prescriptions.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {isSubmitting ? 'Analyzing...' : 'Submit for Analysis'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
