
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, ChevronRight } from 'lucide-react';

const surveySchema = z.object({
  age: z.coerce.number().min(1, "Age is required").max(120, "Please enter a valid age"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender." }),
  concerns: z.string().min(10, "Please describe your health concerns in at least 10 characters."),
  history: z.string().optional(),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function EchoDocSurveyPage() {
  const router = useRouter();

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      concerns: "",
      history: "",
    },
  });

  const { handleSubmit, control } = form;

  const onSubmit = (data: SurveyFormValues) => {
    const prompt = `
        Age: ${data.age}, 
        Gender: ${data.gender}, 
        Health Concerns: ${data.concerns},
        Medical History: ${data.history || 'None'}
    `;
    router.push(`/symptom-checker/results?symptoms=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">New AI Consultation</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Bot className="h-8 w-8 text-primary" />
              Tell Us About Your Health
            </CardTitle>
            <CardDescription>
              Provide some basic information for the AI to understand your condition better. 
              This information will not be stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter your age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={control}
                  name="concerns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Health Concerns</FormLabel>
                      <FormControl>
                        <Textarea 
                            placeholder="e.g., 'I've had a persistent cough and fever for three days...'" 
                            rows={5}
                            {...field} 
                        />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relevant Medical History (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                            placeholder="e.g., 'Diagnosed with asthma, allergic to dust...'" 
                            rows={3}
                            {...field}
                        />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" size="lg" className="w-full">
                  Start AI Consultation
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
